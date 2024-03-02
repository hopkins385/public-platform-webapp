import { Readable, Transform } from 'stream';
import { sendStream } from 'h3';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { ModelEnum } from '../../utils/modelEnum';
import { ChatService } from './../../services/chat.service';
import { getServerSession } from '#auth';
import { AssistantService } from '~/server/services/assistant.service';

const mMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});
const langRule = z.enum(['en', 'de']);
const modelRule = z
  .string()
  .refine((model) => Object.values(ModelEnum).includes(model as ModelEnum));

const bodySchema = z.object({
  messages: z.array(mMessageSchema),
  model: modelRule,
  lang: langRule,
  chatId: z.string().toUpperCase().ulid().optional(),
});

export default defineEventHandler(async (_event) => {
  const { prisma } = _event.context;
  const config = useRuntimeConfig();
  const session = await getServerSession(_event);
  const chatService = new ChatService(prisma);
  const assistantService = new AssistantService(prisma);

  if (!session?.user || !session.user.id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    });
  }

  const validatedBody = await readValidatedBody(_event, (body) =>
    bodySchema.safeParse(body),
  );

  if (!validatedBody.success) {
    console.error(validatedBody.error);
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad request',
    });
  }

  const params = chatService.getChatCompletionParams(
    validatedBody.data.model,
    config,
  );

  const openai = new OpenAI({
    baseURL: params.baseURL,
    apiKey: params.apiKey,
  });

  const chat = await chatService.getFirst(validatedBody.data.chatId);
  // if (!chat) {
  //   throw createError({
  //     statusCode: 404,
  //     statusMessage: 'Not found',
  //   });
  // }

  const systemPrompt = await assistantService.getSystemPrompt(
    validatedBody.data.lang,
    chat?.assistantId,
  );

  // console.log('systemPrompt: ', systemPrompt);
  console.log('messages: ', validatedBody.data.messages);

  try {
    const response = await openai.chat.completions.create({
      model: params.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...validatedBody.data.messages,
      ],
      stream: true,
    });

    let llmResponseMessage = '';

    const stream = Readable.from(response);
    const bufferStream = new Transform({
      objectMode: true,
      transform(chunk, _, callback) {
        const data = chunk as OpenAI.ChatCompletionChunk;
        llmResponseMessage += data.choices[0]?.delta?.content || '';
        callback(null, data.choices[0]?.delta?.content || '');
      },
    });
    stream.pipe(bufferStream);

    stream.on('error', (error) => {
      console.error(error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal server error',
      });
    });

    stream.on('end', () => {
      console.log('stream finished');
    });

    _event.node.res.on('close', () => {
      console.log('response closed');
      stream.destroy();

      // store assistant message in the database
      chatService
        .createMessage({
          chatId: chat?.id || '',
          chatMessage: { role: 'assistant', content: llmResponseMessage },
        })
        .then((res) => {
          console.log('storeMessage result: ', res);
        })
        .catch((error) => {
          console.error(error);
        });
    });

    return sendStream(_event, bufferStream);
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    });
  }
});
