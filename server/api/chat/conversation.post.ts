import { services } from '../../services';
import type { H3Event } from 'h3';
import { getConversationBody } from '~/server/utils/request/chatConversationBody';
import { ChatEvent } from '~/server/utils/enums/chat-event.enum';
import { UsageEvent } from '~/server/utils/enums/usage-event.enum';
import { TrackTokensDto } from '~/server/services/dto/track-tokens.dto';
import { StreamFinishedEventDto } from '~/server/services/dto/event.dto';
import { useEvents } from '~/server/events/useEvents';
import { Readable } from 'stream';
import consola from 'consola';
import { StreamService } from '~/server/services/chat-stream.service';

const { event } = useEvents();
const streamService = new StreamService(event);

const logger = consola.create({}).withTag('conversation.post');

export default defineEventHandler(async (_event) => {
  const abortController = new AbortController();
  const chunkGatherer = streamService.createChunkGatherer({ processInterval: 10 });

  // Needs Auth
  const user = await services.authService.getAuthUser(_event);

  const validatedBody = await getConversationBody(_event);
  const chat = await getChatForUser({ chatId: validatedBody.chatId, userId: user.id });
  const message = await services.chatService.createMessage(user.id, chat.id, validatedBody.messages);
  const systemPrompt = await services.chatService.getContextAwareSystemPrompt({
    assistantId: chat.assistant.id,
    lastMessageContent: message.content,
    assistantSystemPrompt: chat.assistant.systemPrompt,
  });

  streamService.setSSEHeaders(_event);

  // listen for response events
  _event.node.res.once('close', () => {
    abortController.abort();
    onResponseClose({
      chat,
      user,
      body: validatedBody,
      gathered: chunkGatherer.getGatheredContent(),
    })
      .then(() => chunkGatherer.reset())
      .catch((error) => onResponseError(_event, error))
      .finally(() => _event.node.res.end());
  });
  _event.node.res.once('error', (error) => onResponseError(_event, error));
  _event.node.res.once('drain', () => logger.debug('Response drain'));
  _event.node.res.once('finish', () => logger.debug('Response finish'));

  // stream data
  const streamData = {
    signal: abortController.signal,
    userId: user.id,
    chatId: chat.id,
    model: validatedBody.model,
    provider: validatedBody.provider,
    messages: services.chatService.formatChatMessages(validatedBody.messages),
    systemPrompt,
    maxTokens: validatedBody.maxTokens,
  };

  const generator = streamService.generateStream(_event, abortController, streamData);
  const readableStream = Readable.from(generator).pipe(chunkGatherer);

  chunkGatherer.on('error', (error: any) => streamService.handleStreamError(_event, readableStream, error));
  readableStream.on('error', (error: any) => streamService.handleStreamError(_event, readableStream, error));

  return readableStream;
});

async function onResponseClose(payload: { chat: any; user: any; body: any; gathered: string | undefined }) {
  if (!payload.gathered || payload.gathered.length === 0) {
    logger.info('completion finished but gathered text empty. Aborting.');
    return;
  }

  const [inputTokenResult, outputTokenResult] = await Promise.all([
    services.tokenizerService.getTokens(payload.body.messages[payload.body.messages.length - 1].content),
    services.tokenizerService.getTokens(payload.gathered),
  ]);

  const inputTokenCount = inputTokenResult.tokenCount;
  const outputTokenCount = outputTokenResult.tokenCount;

  // creates the response message in the database
  event(
    ChatEvent.STREAM_FINISHED,
    StreamFinishedEventDto.fromInput({
      chatId: payload.chat.id,
      userId: payload.user.id,
      assistantId: payload.chat.assistant.id,
      messageContent: payload.gathered,
    }),
  );

  // tracks the tokens used by the user
  event(
    UsageEvent.TRACKTOKENS,
    TrackTokensDto.fromInput({
      userId: payload.user.id,
      llm: {
        provider: payload.body.provider,
        model: payload.body.model,
      },
      usage: {
        promptTokens: inputTokenCount,
        completionTokens: outputTokenCount,
        totalTokens: inputTokenCount + outputTokenCount,
      },
    }),
  );
}

function onResponseError(_event: H3Event, error: any) {
  logger.error('Response error:', error);
  _event.node.res.end();
}

async function getChatForUser(payload: { chatId: string; userId: string }) {
  const chat = await services.chatService.getChatAndCreditsForUser(payload.chatId, payload.userId);
  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Chat not found',
    });
  }

  // Check if user has enough credits
  if (chat.user.credit[0].amount < 1) {
    throw createError({
      statusCode: 402,
      statusMessage: 'Payment Required',
      message: 'Insufficient credits',
    });
  }

  return chat;
}
