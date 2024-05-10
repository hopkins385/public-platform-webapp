import { VectorService } from './../../services/vector.service';
import { getServerSession } from '#auth';
import { Readable, Transform } from 'stream';
import { sendStream } from 'h3';
import { OpenAI } from 'openai';
import { ChatService } from '~/server/services/chat.service';
import { CompletionFactory } from '~/server/factories/completionFactory';
import { CreditService } from '~/server/services/credit.service';
import { getConversationBody } from '~/server/utils/request/chatConversationBody';
import { ChatEvent } from '~/server/utils/enums/chat-event.enum';
import consola from 'consola';
import { CollectionAbleDto } from '~/server/services/dto/collection-able.dto';
import { CollectionService } from '~/server/services/collection.service';

const config = useRuntimeConfig();
const chatService = new ChatService();
const creditService = new CreditService();

const logger = consola.create({}).withTag('conversation.post');

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);
  const user = getAuthUser(session); // do not remove this line

  const body = await getConversationBody(_event);

  // Check if user has enough credits
  const credit = await creditService.getCreditAmount(user.id);
  if (!credit || credit.amount < 1) {
    throw createError({
      statusCode: 402,
      message:
        'Insufficient credits to continue conversation. Please top up your credits.',
    });
  }

  // Get chat
  const chat = await chatService.getChatForUser(body.chatId, user.id);
  if (!chat) {
    throw createError({
      statusCode: 404,
      message: 'Chat not found',
    });
  }

  // Get collection_ables
  /*
  const collectionService = new CollectionService();
  const colPayload = CollectionAbleDto.fromInput({
    type: 'assistant',
    id: chat.assistant.id,
  });
  const collectionAble =
    await collectionService.findAllWithRecordsFor(colPayload);
  const recordIds =
    collectionAble?.flatMap((ca) => ca.records?.flatMap((r) => r.id)) || [];
  console.log('records', recordIds);
  const vectorService = new VectorService();
  const lastMessage = chat.messages[chat.messages.length - 1];
  const res = await vectorService.searchIndex({
    recordIds,
    query: lastMessage.content,
  });
  console.log('res', res);
  return;
  */

  try {
    const completion = new CompletionFactory(body.model, config);
    const response = await completion.create({
      messages: [
        {
          role: 'system',
          content: chat.assistant.systemPrompt,
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
        message: 'Stream error',
      });
    });

    stream.on('end', () => {
      //
    });

    _event.node.res.on('close', async () => {
      const { event } = useEvents();
      stream.destroy();

      event(ChatEvent.STREAMFINISHED, {
        chatId: chat.id,
        userId: user.id,
        assistantId: chat.assistant.id,
        messageContent: llmResponseMessage,
      });
    });

    return sendStream(_event, bufferStream);
    //
  } catch (error) {
    logger.error(`Chat completion failed: ${error}`);
    throw createError({
      statusCode: 500,
      message: 'Error processing conversation',
    });
  }
});
