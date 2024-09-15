import type { H3Event } from 'h3';
import type { StreamTextResult } from 'ai';
import type { ToolInfoData } from '../../chatTools/chatTools';
import { ChatToolCallEventDto } from '../../events/dto/chatToolCallEvent.dto';
import { VectorService } from '../../services/vector.service';
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
import { streamText } from 'ai';
import { AiCompletionFactory } from '~/server/factories/completionFactory';
import { getTools } from '../../chatTools/chatTools';
import { CollectionAbleDto } from '~/server/services/dto/collection-able.dto';
import { Readable, Transform } from 'stream';
import prisma from '~/server/prisma';
import consola from 'consola';
import qdrant from '~/server/qdrant';

const { event } = useEvents();

const chatService = new ChatService(prisma);
const collectionService = new CollectionService(prisma);
const vectorService = new VectorService(qdrant);
const tokenizerService = new TokenizerService();

const logger = consola.create({}).withTag('conversation.post');

export default defineEventHandler(async (_event) => {
  // Needs Auth
  const session = await getServerSession(_event);
  const user = getAuthUser(session); // throws error if user not found

  // Get validated conversation body
  const body = await getConversationBody(_event);

  // Check if user is allowed to access the chat and has enough credits
  const chat = await getChatForUser({ chatId: body.chatId, userId: user.id });

  // Check if chat has messages
  const lastMessage = getLastChatMessage(body.messages);

  // Store last message in the database
  const message = await chatService.createMessage(
    CreateChatMessageDto.fromInput({
      userId: chat.user.id,
      chatId: chat.id,
      message: lastMessage,
    }),
  );

  // Update chat title if it's the first message of the chat
  if (body.messages.length === 1) {
    event(
      ChatEvent.FIRST_USERMESSAGE,
      FirstUserMessageEventDto.fromInput({
        chatId: chat.id,
        userId: user.id,
        messageContent: body.messages[0].content,
      }),
    );
  }

  // Format chat messages
  const chatMessages = formatChatMessages(body.messages);

  let systemPrompt = undefined;

  // check if assistant has knowledge collections
  // await checkCollection()
  systemPrompt = chat.assistant.systemPrompt;

  // add current date at the end of the system prompt
  systemPrompt += '\n\n' + 'Timestamp now(): ' + new Date().toISOString();

  // dd(messages);

  let gathered: string | undefined = undefined;

  const gatherChunks = () => {
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

  const controller = new AbortController();

  // listen for response events
  _event.node.res.on('close', () => onResponseClose(_event, controller, chat, user, body, gathered));
  _event.node.res.on('error', (error) => onResponseError(_event, error));
  _event.node.res.on('drain', () => logger.debug('Response drain'));

  // set proper headers
  _event.node.res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  _event.node.res.setHeader('Cache-Control', 'no-cache');
  _event.node.res.setHeader('Connection', 'keep-alive');
  _event.node.res.setHeader('Transfer-Encoding', 'chunked');
  _event.node.res.setHeader('X-Accel-Buffering', 'no');

  // stream data
  const streamData = {
    signal: controller.signal,
    userId: user.id,
    chatId: chat.id,
    model: body.model,
    provider: body.provider,
    messages: chatMessages,
    systemPrompt,
    maxTokens: body.maxTokens,
  };

  const generator = generateStream(streamData);
  const readableStream = Readable.from(generator).pipe(gatherChunks());
  readableStream.on('error', (error) => onStreamError(_event, readableStream, error));

  return readableStream;
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
}

function onStreamError(_event: H3Event, stream: any, error: any) {
  logger.error('Generator stream error:', JSON.stringify(error));
  stream?.destroy();
  _event.node.res.end();
}

function onResponseClose(
  _event: H3Event,
  controller: AbortController,
  chat: any,
  user: any,
  body: any,
  gathered: string | undefined,
) {
  controller.abort();

  if (!gathered || gathered.length === 0) {
    logger.error('completion finished but gathered text empty. This is causing errors on token calc!');
  }

  const inputTokens = tokenizerService.getTokens(body.messages[body.messages.length - 1].content);
  const outputTokens = tokenizerService.getTokens(gathered);

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

  _event.node.res.end();
}

function onResponseError(_event: H3Event, error: any) {
  logger.error('Response error:', error);
  _event.node.res.end();
}

function onToolStartCall(payload: ChatToolCallEventDto) {
  event(ChatEvent.TOOL_START_CALL, payload);
}

function onToolEndCall(payload: ChatToolCallEventDto) {
  event(ChatEvent.TOOL_END_CALL, payload);
}

// TODO: stream stop event: show continue button
function onStreamStopLength() {
  logger.debug('Stream stop length event');
  // event(ChatEvent.STREAM_STOP_LENGTH, {});
}

function toolStartCallback(payload: StreamPayload) {
  return (toolInfoData: ToolInfoData) =>
    onToolStartCall(
      ChatToolCallEventDto.fromInput({
        userId: payload.userId,
        chatId: payload.chatId,
        toolName: toolInfoData.toolName,
        toolInfo: toolInfoData.toolInfo,
      }),
    );
}

function logWarnings(warnings: any[] | undefined) {
  if (warnings?.length) {
    logger.warn('Initial result warnings:', warnings);
  }
}

function handleStreamGeneratorError(error: any) {
  if (error.name === 'AbortError') return;
  logger.error('Stream generator error:', JSON.stringify(error));
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error',
    message: 'Failed to generate stream',
  });
}

async function* generateStream(payload: StreamPayload) {
  const model = AiCompletionFactory.fromInput(payload.provider, payload.model);
  const availableTools = payload.provider !== 'groq' ? getTools(toolStartCallback(payload)) : undefined;

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
    handleStreamGeneratorError(error);
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
      logger.error(`Chunk error: ${JSON.stringify(chunk.error)}`);
      yield chunk.error;
      return;
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

  //TODO: track token usage for tools

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

async function getChatForUser(payload: { chatId: string; userId: string }) {
  const chat = await chatService.getChatAndCreditsForUser(payload.chatId, payload.userId);
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

function getLastChatMessage(messages: any[]) {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    logger.error('No last message');
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid body message length',
    });
  }
  return lastMessage;
}

async function checkCollection() {
  throw new Error('Not implemented');
  const collections = await collectionService.findAllWithRecordsFor(
    CollectionAbleDto.fromInput({
      id: assistantId,
      type: 'assistant',
    }),
  );

  if (collections.length > 0) {
    const recordIds = collections.map((c) => c.records.map((r) => r.id)).flat();
    const res = await vectorService.searchIndex({
      query: lastMessage.content,
      recordIds,
    });

    const context = res.map((r) => r?.content || '').join('\n\n');

    systemPrompt = chat.assistant.systemPrompt + '\n\n<context>' + context + '</context>';
  } else {
    systemPrompt = chat.assistant.systemPrompt;
  }
}
