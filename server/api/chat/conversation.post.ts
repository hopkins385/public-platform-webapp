import type { AIMessageChunk } from '@langchain/core/messages';
import { TokenizerService } from '~/server/services/tokenizer.service';
import { getServerSession } from '#auth';
import { Readable, Transform } from 'stream';
import { sendStream } from 'h3';
import { ChatService } from '~/server/services/chat.service';
import { getConversationBody } from '~/server/utils/request/chatConversationBody';
import { ChatEvent } from '~/server/utils/enums/chat-event.enum';
import { UsageEvent } from '~/server/utils/enums/usage-event.enum';
import { TrackTokensDto } from '~/server/services/dto/track-tokens.dto';
import { StreamFinishedEventDto, FirstUserMessageEventDto } from '~/server/services/dto/event.dto';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import { useEvents } from '~/server/events/useEvents';
import consola from 'consola';
import { SystemMessage } from '@langchain/core/messages';
import { CompletionFactory } from '~/server/factories/completionFactory';
import { toLangchainMessages } from '~/server/utils/chat/toLangchainMessages';
import { concat } from '@langchain/core/utils/stream';

const prisma = getPrismaClient();
const chatService = new ChatService(prisma);
const tokenizerService = new TokenizerService();

const logger = consola.create({}).withTag('conversation.post');

export default defineEventHandler(async (_event) => {
  const controller = new AbortController();
  const config = useRuntimeConfig();
  const session = await getServerSession(_event);
  const user = getAuthUser(session); // do not remove this line

  const body = await getConversationBody(_event);

  // Check if user has enough credits and is allowed to access the chat
  const chat = await chatService.getChatAndCreditsForUser(body.chatId, user.id);
  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Chat not found',
    });
  }

  if (chat.user.credit[0].amount < 1) {
    throw createError({
      statusCode: 402,
      statusMessage: 'Payment Required',
      message: 'Insufficient credits',
    });
  }

  const lastMessage = body.messages[body.messages.length - 1];
  if (!lastMessage) {
    logger.error('No last message');
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid body message length',
    });
  }

  const message = await chatService.createMessage(
    CreateChatMessageDto.fromInput({
      userId: chat.user.id,
      chatId: chat.id,
      message: lastMessage,
    }),
  );

  // Event to update chat title
  if (body.messages.length === 1) {
    const { event } = useEvents();
    event(
      ChatEvent.FIRST_USERMESSAGE,
      FirstUserMessageEventDto.fromInput({
        chatId: chat.id,
        userId: user.id,
        messageContent: body.messages[0].content,
      }),
    );
  }

  const bodyMessages = toLangchainMessages(body.messages);

  // TODO: handle context size of llm and reduce messages
  const messages = [new SystemMessage({ content: chat.assistant.systemPrompt }), ...bodyMessages];

  // dd(messages);

  try {
    const completion = new CompletionFactory(body.provider, body.model, config);
    const model = await completion.create({
      maxTokens: body.maxTokens,
      temperature: body.temperature,
    });

    const completionStream = await model.stream(messages, { signal: controller.signal });

    let gathered: AIMessageChunk | undefined = undefined;

    const stream = Readable.from(completionStream);
    const bufferStream = new Transform({
      objectMode: true,
      transform(chunk, _, callback) {
        const { content } = chunk as AIMessageChunk;
        gathered = gathered !== undefined ? concat(gathered, chunk) : chunk;
        callback(null, content);
      },
    });
    stream.pipe(bufferStream);

    stream.on('error', (error) => {
      logger.error(`Stream failed: ${error}`);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Stream error',
      });
    });

    stream.on('end', async () => {
      // console.log('END gathered', gathered);
    });

    _event.node.res.on('close', () => {
      controller.abort();
      stream.destroy();

      const inputTokens = tokenizerService.getTokens(body.messages[body.messages.length - 1].content);
      const outputTokens = tokenizerService.getTokens(gathered?.content?.toString() || '');
      const { event } = useEvents();

      event(
        ChatEvent.STREAMFINISHED,
        StreamFinishedEventDto.fromInput({
          chatId: chat.id,
          userId: user.id,
          assistantId: chat.assistant.id,
          messageContent: gathered?.content?.toString() || '',
        }),
      );

      event(
        UsageEvent.TRACKTOKENS,
        TrackTokensDto.fromInput({
          userId: user.id,
          llm: {
            provider: body.provider,
            model: body.model,
          },
          usage: {
            promptTokens: inputTokens.tokenCount,
            completionTokens: outputTokens.tokenCount,
            totalTokens: inputTokens.tokenCount + outputTokens.tokenCount,
          },
        }),
      );
    });

    return sendStream(_event, bufferStream);
    //
  } catch (error) {
    logger.error(`Chat completion failed: ${error}`);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Error processing conversation',
    });
  }
});

// Function to call the tool with the extracted arguments
async function callTool(name: string, args: any): Promise<string> {
  // Implement the logic to call the tool and return the result
  // For example:
  // const result = await someToolService.call(args);
  // return result;
  return 'Tool result'; // Placeholder
}
