import { TokenizerService } from '~/server/services/tokenizer.service';
import { getServerSession } from '#auth';
import { Readable, Transform } from 'stream';
import { sendStream } from 'h3';
import { OpenAI } from 'openai';
import { ChatService } from '~/server/services/chat.service';
import { getConversationBody } from '~/server/utils/request/chatConversationBody';
import { ChatEvent } from '~/server/utils/enums/chat-event.enum';
import { UsageEvent } from '~/server/utils/enums/usage-event.enum';
import { TrackTokensDto } from '~/server/services/dto/track-tokens.dto';
import type { ChatMessage, VisionImageUrlContent } from '~/interfaces/chat.interfaces';
import { StreamFinishedEventDto, FirstUserMessageEventDto } from '~/server/services/dto/event.dto';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import { useEvents } from '~/server/events/useEvents';
import { CompletionFactoryStatic } from '~/server/factories/completionFactoryStatic';
import consola from 'consola';

const prisma = getPrismaClient();
const chatService = new ChatService(prisma);
const tokenizerService = new TokenizerService();

const logger = consola.create({}).withTag('conversation.post');

export default defineEventHandler(async (_event) => {
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
      return {
        type: 'image_url',
        image_url: {
          url: v.url,
        },
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
    });
  }

  const bodyMessages = normalizeBodyMessages(body.messages);

  // TODO: handle context size of llm and reduce messages
  const messages = [
    {
      role: 'system',
      content: chat.assistant.systemPrompt,
    },
    ...bodyMessages,
  ];

  // dd(messages);

  try {
    const completion = new CompletionFactoryStatic(body.provider, body.model);
    const response = await completion.create({
      messages,
      maxTokens: body.maxTokens,
      temperature: body.temperature,
      stream: true,
    });

    let llmResponseMessage = '';

    const stream = Readable.from(response);
    const bufferStream = new Transform({
      objectMode: true,
      transform(chunk, _, callback) {
        if (body.model.startsWith('claude')) {
          const data = chunk;
          llmResponseMessage += data.delta?.text || '';
          callback(null, data.delta?.text || '');
        } else {
          const data = chunk as OpenAI.ChatCompletionChunk;
          llmResponseMessage += data.choices[0]?.delta?.content || '';
          callback(null, data.choices[0]?.delta?.content || '');
        }
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

    stream.on('end', () => {
      //
    });

    _event.node.res.on('close', () => {
      stream.destroy();

      const inputTokens = tokenizerService.getTokens(body.messages[body.messages.length - 1].content);
      const outputTokens = tokenizerService.getTokens(llmResponseMessage);
      const { event } = useEvents();

      event(
        ChatEvent.STREAMFINISHED,
        StreamFinishedEventDto.fromInput({
          chatId: chat.id,
          userId: user.id,
          assistantId: chat.assistant.id,
          messageContent: llmResponseMessage,
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
