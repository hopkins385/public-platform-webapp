import type { ChatMessage, VisionImageUrlContent } from '~/interfaces/chat.interfaces';
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
import { streamText, type StreamTextResult } from 'ai';
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

  function getVisionMessages(vis: VisionImageUrlContent[] | null | undefined) {
    if (!vis) {
      return [];
    }
    return vis.map((v) => {
      if (!v.url) throw new Error('VisionImageUrlContent url is required');
      // this format is vercel ai sdk specific!
      return {
        type: 'image',
        image: new URL(v.url),
      };
    });
  }

  function normalizeBodyMessages(messages: ChatMessage[] | null | undefined) {
    if (!messages) {
      return [];
    }
    return messages.map((message) => {
      if (message.type === 'image' && message.visionContent) {
        const text = {
          type: 'text',
          text: message.content,
        };
        return {
          role: message.role,
          content: [text, ...getVisionMessages(message.visionContent)],
        };
      }
      return {
        role: message.role,
        content: message.content,
      };
    }); // satisfies CoreMessage[];
  }

  const bodyMessages = normalizeBodyMessages(body.messages);

  let systemPrompt = undefined;

  // assistant has knowledge
  const assistantModelDto = CollectionAbleDto.fromInput({
    id: chat.assistant.id,
    type: 'assistant',
  });
  const collections = await collectionService.findAllWithRecordsFor(assistantModelDto);

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
    const outputTokens = tokenizerService.getTokens(gathered);
    const { event } = useEvents();

    // creates the response message in the database
    event(
      ChatEvent.STREAM_FINISHED,
      StreamFinishedEventDto.fromInput({
        chatId: chat.id,
        userId: user.id,
        assistantId: chat.assistant.id,
        messageContent: gathered,
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
    model: body.model,
    provider: body.provider,
    messages: bodyMessages,
    systemPrompt,
    maxTokens: body.maxTokens,
    config,
  };

  try {
    const generator = generateStream(generateStreamData);
    const stream = Readable.from(generator).pipe(gatherCunks());
    return stream;
  } catch (error) {
    logger.error('Stream error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Error processing conversation',
    });
  }
});

interface StreamPayload {
  signal: AbortSignal;
  userId: string;
  chatId: string;
  model: string;
  provider: string;
  messages: any[];
  systemPrompt: string;
  maxTokens: number;
  config: any;
}

function onToolStartCall(payload: ChatToolCallEventDto) {
  const { event } = useEvents();
  event(ChatEvent.TOOL_START_CALL, payload);
}

function onToolEndCall(payload: ChatToolCallEventDto) {
  const { event } = useEvents();
  event(ChatEvent.TOOL_END_CALL, payload);
}

// TODO: stream stop event: show continue button
function onStreamStopLength() {
  logger.debug('Stream stop length event');
  // const { event } = useEvents();
  // event(ChatEvent.STREAM_STOP_LENGTH, {});
}

function createToolStartCallHandler(payload: StreamPayload) {
  return (toolName: string) =>
    onToolStartCall(
      ChatToolCallEventDto.fromInput({
        userId: payload.userId,
        chatId: payload.chatId,
        toolName,
      }),
    );
}

function logWarnings(warnings: any[] | undefined) {
  if (warnings?.length) {
    logger.warn('Initial result warnings:', warnings);
  }
}

function handleStreamError(error: any) {
  if (error.name === 'AbortError') return;
  logger.error('Stream generator error:', error);
  throw error;
}

async function* generateStream(payload: StreamPayload) {
  const model = VercelCompletionFactory.fromInput(payload.provider, payload.model, payload.config);
  const availableTools = payload.provider !== 'groq' ? getTools(createToolStartCallHandler(payload)) : undefined;

  try {
    const initialResult = await streamText({
      abortSignal: payload.signal,
      model,
      system: payload.systemPrompt,
      messages: payload.messages,
      maxTokens: payload.maxTokens,
      tools: availableTools,
    });

    logWarnings(initialResult.warnings);

    yield* handleStream(initialResult, payload, model, availableTools);
  } catch (error: any) {
    handleStreamError(error);
  }
}

async function* handleStream(
  initalResult: StreamTextResult<any>,
  payload: StreamPayload,
  model: any,
  availableTools: any,
) {
  const stream = initalResult.fullStream;
  for await (const chunk of stream) {
    if (payload.signal.aborted) return;

    if (chunk.type === 'error') {
      throw new Error(`Chunk error: ${chunk.error}`);
    }

    if (chunk.type === 'finish') {
      switch (chunk.finishReason) {
        case 'error':
          throw new Error(`Finish Error: ${JSON.stringify(initalResult.rawResponse)}`);
        case 'length':
          onStreamStopLength();
          return;
        case 'tool-calls':
          yield* handleToolCalls(initalResult, payload, model, availableTools);
          return;
      }
    }

    if (chunk.type === 'text-delta') {
      yield chunk.textDelta;
    }
  }
}

async function* handleToolCalls(
  initalResult: StreamTextResult<any>,
  payload: StreamPayload,
  model: any,
  availableTools: any,
) {
  const [toolCalls, toolResults] = await Promise.all([initalResult.toolCalls, initalResult.toolResults]);

  const toolMessages = [
    { role: 'assistant', content: toolCalls },
    { role: 'tool', content: toolResults },
  ];

  const followUpResult = await streamText({
    abortSignal: payload.signal,
    model,
    system: payload.systemPrompt,
    messages: [...payload.messages, ...toolMessages],
    maxTokens: payload.maxTokens,
    tools: availableTools,
  });

  const toolName = toolResults[0]?.toolName || '';
  onToolEndCall(
    ChatToolCallEventDto.fromInput({
      userId: payload.userId,
      chatId: payload.chatId,
      toolName,
    }),
  );

  yield* followUpResult.textStream;
}
