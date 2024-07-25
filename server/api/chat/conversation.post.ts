import { VectorService } from './../../services/vector.service';
import { CollectionService } from '~/server/services/collection.service';
import { TokenizerService } from '~/server/services/tokenizer.service';
import { getServerSession } from '#auth';
import { ChatService } from '~/server/services/chat.service';
import { getConversationBody } from '~/server/utils/request/chatConversationBody';
import { ChatEvent } from '~/server/utils/enums/chat-event.enum';
import { UsageEvent } from '~/server/utils/enums/usage-event.enum';
import { TrackTokensDto } from '~/server/services/dto/track-tokens.dto';
import { StreamFinishedEventDto, FirstUserMessageEventDto } from '~/server/services/dto/event.dto';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import { useEvents } from '~/server/events/useEvents';
import consola from 'consola';
import { streamText } from 'ai';
import { VercelCompletionFactory } from '~/server/factories/vercelCompletionFactory';
import { getTools } from '../../chatTools/vercelChatTools';
import { CollectionAbleDto } from '~/server/services/dto/collection-able.dto';

const config = useRuntimeConfig();
const prisma = getPrismaClient();
const chatService = new ChatService(prisma);
const tokenizerService = new TokenizerService();
const vectorService = new VectorService(config);
const collectionService = new CollectionService(prisma);

const logger = consola.create({}).withTag('conversation.post');

export default defineEventHandler(async (_event) => {
  const controller = new AbortController();

  // Auth
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

  let systemPrompt = undefined;

  // assistant has knowledge
  const dto = CollectionAbleDto.fromInput({
    id: chat.assistant.id,
    type: 'assistant',
  });
  const collections = await collectionService.findAllWithRecordsFor(dto);

  if (collections.length > 0) {
    const recordIds = collections.map((c) => c.records.map((r) => r.id)).flat();
    const res = await vectorService.searchIndex({
      query: lastMessage.content,
      recordIds,
    });

    const context = res.map((r) => r?.content || '').join('\n\n');

    systemPrompt = chat.assistant.systemPrompt + '\n\n<context>' + context + '</context>';
  } else {
    systemPrompt = chat.assistant.systemPrompt.toString();
  }

  // dd(messages);

  let gathered: string | undefined = undefined;

  const createLoggingTransformStream = () => {
    return new TransformStream({
      transform(chunk: any, controller: TransformStreamDefaultController) {
        // Log the chunk
        // console.log('Received chunk:', chunk);
        if (!gathered) {
          gathered = chunk;
        } else {
          gathered += chunk;
        }

        // Pass the chunk along unchanged
        controller.enqueue(chunk);
      },
    });
  };

  const tools = getTools(() => console.log('Executing tool'));

  try {
    const model = VercelCompletionFactory.fromInput(body.provider, body.model, config);

    const result = await streamText({
      abortSignal: controller.signal,
      model,
      system: systemPrompt,
      messages: body.messages,
      maxTokens: body.maxTokens,
      // tools,
      // onFinish(result) {
      //   console.log('onFinish tool results: ', result.toolResults);
      // },
    });

    const stream = result.textStream.pipeThrough(createLoggingTransformStream());

    _event.node.res.on('close', () => {
      controller.abort();

      if (!gathered || gathered.length === 0) {
        logger.error('completion finished but gathered text empty. This is causing errors on token calc!');
      }

      const inputTokens = tokenizerService.getTokens(body.messages[body.messages.length - 1].content);
      const outputTokens = tokenizerService.getTokens(gathered || '');
      const { event } = useEvents();

      // creates the response message in the database
      event(
        ChatEvent.STREAMFINISHED,
        StreamFinishedEventDto.fromInput({
          chatId: chat.id,
          userId: user.id,
          assistantId: chat.assistant.id,
          messageContent: gathered || '',
        }),
      );

      // tracks the tokens used by the user
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

    return sendStream(_event, stream);
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
