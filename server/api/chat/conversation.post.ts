import { ChatToolCallEventDto } from './../../events/dto/chatToolCallEvent.dto';
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
import { convertToCoreMessages, streamText } from 'ai';
import { VercelCompletionFactory } from '~/server/factories/vercelCompletionFactory';
import { getTools } from '../../chatTools/vercelChatTools';
import { CollectionAbleDto } from '~/server/services/dto/collection-able.dto';
import { Readable, Transform } from 'stream';

const prisma = getPrismaClient();
const chatService = new ChatService(prisma);
const tokenizerService = new TokenizerService();
const collectionService = new CollectionService(prisma);

const logger = consola.create({}).withTag('conversation.post');

export default defineEventHandler(async (_event) => {
  const controller = new AbortController();

  const config = useRuntimeConfig();
  const vectorService = new VectorService(config);

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

  const gatherCunks = () => {
    const transform = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        if (gathered === undefined) {
          gathered = chunk;
        } else {
          gathered += chunk;
        }
        callback(null, chunk);
      },
    });

    return transform;
  };

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
      ChatEvent.STREAM_FINISHED,
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

  const generateStreamData = {
    signal: controller.signal,
    userId: user.id,
    chatId: chat.id,
    body,
    systemPrompt,
    config,
  };

  try {
    const stream = Readable.from(generateStream(generateStreamData)).pipe(gatherCunks());
    return stream;
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

function onToolStartCall(payload: ChatToolCallEventDto) {
  const { event } = useEvents();
  event(ChatEvent.TOOL_START_CALL, payload);
}

function onToolEndCall(payload: ChatToolCallEventDto) {
  const { event } = useEvents();
  event(ChatEvent.TOOL_END_CALL, payload);
}

function onStreamStopLength() {
  const { event } = useEvents();
  event(ChatEvent.STREAM_STOP_LENGTH, {});
}

async function* generateStream(payload: {
  signal: AbortSignal;
  userId: string;
  chatId: string;
  body: any;
  systemPrompt: any;
  config: any;
}) {
  const model = VercelCompletionFactory.fromInput(payload.body.provider, payload.body.model, payload.config);
  const tools = getTools((toolName) =>
    onToolStartCall(
      ChatToolCallEventDto.fromInput({
        userId: payload.userId,
        chatId: payload.chatId,
        toolName,
      }),
    ),
  );
  try {
    const initialResult = await streamText({
      abortSignal: payload.signal,
      model,
      system: payload.systemPrompt,
      messages: convertToCoreMessages(payload.body.messages),
      maxTokens: payload.body.maxTokens,
      tools: payload.body.provider === 'openai' ? tools : undefined,
    });

    for await (const chunk of initialResult.fullStream) {
      if (payload.signal.aborted) return;

      if (chunk.type === 'finish' && chunk.finishReason === 'length') {
        onStreamStopLength();
        //
      } else if (chunk.type === 'finish' && chunk.finishReason === 'tool-calls') {
        const toolResults = await initialResult.toolResults;

        // tool name
        const toolName = toolResults?.[0]?.toolName || '';

        console.log('tool results: ', toolResults);

        // TODO: Track token usage on tool calls

        const toolCallMessage = {
          role: 'assistant',
          content: '',
          toolInvocations: toolResults,
        };

        const followUpResult = await streamText({
          abortSignal: payload.signal,
          model,
          system: payload.systemPrompt,
          messages: convertToCoreMessages([...payload.body.messages, toolCallMessage]),
          maxTokens: payload.body.maxTokens,
        });

        onToolEndCall(
          ChatToolCallEventDto.fromInput({
            userId: payload.userId,
            chatId: payload.chatId,
            toolName,
          }),
        );

        for await (const followUpChunk of followUpResult.textStream) {
          if (payload.signal.aborted) return;
          yield followUpChunk;
        }
        //
      } else {
        const text = chunk?.textDelta;
        if (!text || text === undefined) {
          continue;
        }
        yield text;
      }
    }
  } catch (error: any) {
    // ignore abort errors
    if (error.name === 'AbortError') {
      return;
    }
    console.error('Stream processing error:', error);
    throw error;
  }
}
