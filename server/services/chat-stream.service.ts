import type { H3Event } from 'h3';
import type { UseEvents } from '../events/useEvents';
import type { ToolInfoData } from '~/interfaces/tool.interfaces';
import consola from 'consola';
import { AiModelFactory } from '../factories/aiModelFactory';
import { streamText, type LanguageModelV1, type StreamTextResult } from 'ai';
import { ChatToolCallEventDto } from '../events/dto/chatToolCallEvent.dto';
import { getTools } from '../chatTools/chatTools';
import { ChunkGatherer } from './chunk-gatherer.service';

interface GenerateStreamOptions {
  timeoutDuration?: number; // in milliseconds
}

const logger = consola.create({}).withTag('streamService');

export class StreamService {
  constructor(
    private readonly event: UseEvents['event'],
    private readonly maxToolCallDepth = 3,
  ) {}

  setSSEHeaders(_event: H3Event) {
    _event.node.res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    _event.node.res.setHeader('Cache-Control', 'no-cache');
    _event.node.res.setHeader('Connection', 'keep-alive');
    _event.node.res.setHeader('Transfer-Encoding', 'chunked');
    _event.node.res.setHeader('X-Accel-Buffering', 'no');
  }

  createChunkGatherer(options: { processInterval?: number } = {}): ChunkGatherer {
    return new ChunkGatherer({ processInterval: options.processInterval });
  }

  createCallSettings(payload: StreamPayload) {
    const isPreview = payload.model.startsWith('o1-');
    const filterTools = () => {
      switch (payload.provider) {
        case ChatModelProviderEnum.GROQ:
        case ChatModelProviderEnum.MISTRAL:
          return undefined;
        default:
          return getTools(payload.functionIds, this.toolStartCallback(payload));
      }
    };

    const availableTools = filterTools();

    return {
      availableTools,
      settings: isPreview
        ? {}
        : {
            system: payload.systemPrompt,
            tools: availableTools,
            maxTokens: payload.maxTokens,
          },
    };
  }

  async *generateStream(
    _event: H3Event,
    abortController: AbortController,
    payload: StreamPayload,
    options: GenerateStreamOptions = {},
  ) {
    const timeoutDuration = options.timeoutDuration ?? 180000; // Default to 3 mins
    const model = AiModelFactory.fromInput({ provider: payload.provider, model: payload.model });

    const { settings: callSettings, availableTools } = this.createCallSettings(payload);

    // Set up a timeout to abort the request after the specified duration
    const timeoutId = setTimeout(() => {
      abortController.abort();
      logger.warn(`Request aborted after ${timeoutDuration}ms due to timeout.`);
    }, timeoutDuration);

    try {
      const initialResult = await streamText({
        abortSignal: abortController.signal,
        model,
        messages: payload.messages,
        maxSteps: 1,
        maxRetries: 3,
        ...callSettings,
      });

      clearTimeout(timeoutId);
      this.logWarnings(initialResult.warnings);

      yield* this.handleStream(abortController, initialResult, payload, model, availableTools);
    } catch (error: any) {
      this.handleStreamGeneratorError(_event, error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async *handleStream(
    abortController: AbortController,
    result: StreamTextResult<any>,
    payload: StreamPayload,
    model: LanguageModelV1,
    availableTools: any,
  ): AsyncGenerator<any, void, any> {
    for await (const chunk of result.fullStream) {
      if (abortController.signal.aborted) return;

      if (chunk.type === 'error') {
        throw chunk.error;
      }

      if (chunk.type === 'finish') {
        switch (chunk.finishReason) {
          case 'error':
            throw new Error(`Finish Error: ${JSON.stringify(result.response)}`);
          case 'length':
            this.onStreamStopLength();
            return;
          case 'tool-calls':
            payload.toolCallRecursion++;
            yield* this.handleToolCalls(abortController, result, payload, model, availableTools);
            return;
        }
      }

      if (chunk.type === 'text-delta') {
        yield chunk.textDelta;
      }
    }
  }

  private async *handleToolCalls(
    abortController: AbortController,
    initalResult: StreamTextResult<any>,
    payload: StreamPayload,
    model: any,
    availableTools: any,
  ): AsyncGenerator<any, void, any> {
    if (payload.toolCallRecursion >= this.maxToolCallDepth) {
      throw new Error('Tool call depth exceeded');
    }

    const [toolCalls, toolResults] = await Promise.all([initalResult.toolCalls, initalResult.toolResults]);

    // Ensure toolResults is not empty to avoid infinite loop
    if (!toolResults || toolResults.length === 0) {
      logger.warn('No tool results, exiting generator.');
      return;
    }

    const toolMessages = [
      { role: 'assistant', content: toolCalls },
      { role: 'tool', content: toolResults },
    ];

    try {
      const result = await streamText({
        abortSignal: abortController.signal,
        model,
        system: payload.systemPrompt,
        messages: [...payload.messages, ...toolMessages],
        maxTokens: payload.maxTokens,
        tools: availableTools,
        maxSteps: 1,
        maxRetries: 3,
      });

      //TODO: track token usage for tools

      const toolName = toolResults[0]?.toolName || '';
      this.onToolEndCall(
        ChatToolCallEventDto.fromInput({
          userId: payload.userId,
          chatId: payload.chatId,
          toolName,
        }),
      );

      for await (const chunk of result.fullStream) {
        if (abortController.signal.aborted) return;

        if (chunk.type === 'error') {
          throw chunk.error;
        }

        if (chunk.type === 'finish') {
          switch (chunk.finishReason) {
            case 'error':
              throw new Error(`Finish Error: ${JSON.stringify(result.response)}`);
            case 'length':
              this.onStreamStopLength();
              return;
            case 'tool-calls':
              payload.toolCallRecursion++;
              yield* this.handleToolCalls(abortController, result, payload, model, availableTools);
              return;
          }
        }

        if (chunk.type === 'text-delta') {
          yield chunk.textDelta;
        }
      }

      // yield* textStream;
      // yield* this.handleStream(abortController, followUpResult, payload, model, availableTools);
    } catch (error) {
      logger.error('handleToolCalls error:', JSON.stringify(error));
      yield '';
    }
  }

  private handleStreamGeneratorError(_event: H3Event, error: any) {
    if (error?.name === 'AbortError') return;
    logger.error('streamGeneratorError:', error?.message ?? error);
    _event.node.res.statusCode = 422;
    _event.node.res.end();
  }

  handleStreamError(_event: H3Event, stream: any, error: any) {
    logger.error('streamError:', JSON.stringify(error));
    stream?.destroy();
    _event.node.res.statusCode = 422;
    _event.node.res.end();
  }

  private logWarnings(warnings: any[] | undefined) {
    if (warnings?.length) {
      logger.warn('Initial result warnings:', warnings);
    }
  }

  private toolStartCallback(payload: StreamPayload) {
    return (toolInfoData: ToolInfoData) =>
      this.onToolStartCall(
        ChatToolCallEventDto.fromInput({
          userId: payload.userId,
          chatId: payload.chatId,
          toolName: toolInfoData.toolName,
          toolInfo: toolInfoData.toolInfo,
        }),
      );
  }

  private onToolEndCall(payload: ChatToolCallEventDto) {
    this.event(ChatEvent.TOOL_END_CALL, payload);
  }

  private onToolStartCall(payload: ChatToolCallEventDto) {
    this.event(ChatEvent.TOOL_START_CALL, payload);
  }

  // TODO: stream stop event: show continue button
  private onStreamStopLength() {
    logger.debug('Stream stop length event');
    // event(ChatEvent.STREAM_STOP_LENGTH, {});
  }
}

interface StreamPayload {
  userId: string;
  chatId: string;
  functionIds: number[];
  model: string;
  provider: string;
  messages: any[];
  systemPrompt: string;
  maxTokens: number;
  toolCallRecursion: number;
}
