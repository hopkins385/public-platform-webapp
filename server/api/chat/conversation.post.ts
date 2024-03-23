import { Readable, Transform } from 'stream';
import { sendStream } from 'h3';
import { OpenAI } from 'openai';
import { ChatService } from './../../services/chat.service';
import { AssistantService } from '~/server/services/assistant.service';
import { CompletionFactory } from '~/server/factories/completionFactory';
import { CreditService } from '~/server/services/credit.service';
import { getConversationBody } from '~/server/utils/request/chatConversationBody';

const config = useRuntimeConfig();

export default defineEventHandler(async (_event) => {
  const { prisma } = _event.context;
  const chatService = new ChatService(prisma);
  const assistantService = new AssistantService(prisma);
  const creditService = new CreditService(prisma);

  const user = await getAuthUser(_event);
  const body = await getConversationBody(_event);
  const credit = await creditService.getCreditAmount(user.id);

  if (!credit || credit.amount < 1) {
    throw createError({
      statusCode: 402,
      statusMessage: 'Insufficient credits',
    });
  }

  const chat = await chatService.getChatForUser(body.chatId ?? '', user.id);

  const history = chatService.getHistory(chat, 4095, body.maxTokens);

  const systemPrompt = await assistantService.getSystemPrompt(
    body.lang,
    chat?.assistant.id,
  );

  try {
    const completion = new CompletionFactory(body.model, config, prisma);
    const response = await completion.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...body.messages, // TODO: handle context size of llm and reduce messages
        // ...history,
      ],
      maxTokens: body.maxTokens,
      temperature: body.temperature,
    });

    let llmResponseMessage = '';

    const stream = Readable.from(response);
    const bufferStream = new Transform({
      objectMode: true,
      transform(chunk, _, callback) {
        if (
          body.model === ModelEnum.Claude3Haiku ||
          body.model === ModelEnum.Claude3Opus ||
          body.model === ModelEnum.Claude3Sonnet
        ) {
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
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal server error (stream error)',
      });
    });

    stream.on('end', () => {
      //
    });

    _event.node.res.on('close', async () => {
      stream.destroy();

      // store assistant message in the database
      try {
        await chatService.createMessage({
          chatId: chat?.id || '',
          chatMessage: { role: 'assistant', content: llmResponseMessage },
        });
      } catch (error) {
        // silently fail
      }

      await creditService.reduceCredit(user.id, 1);
    });

    return sendStream(_event, bufferStream);
    //
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    });
  }
});
