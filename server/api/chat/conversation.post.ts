import { Readable, Transform } from 'stream';
import type { PrismaClient } from '@prisma/client';
import { sendStream } from 'h3';
import { OpenAI } from 'openai';
import { backOff } from 'exponential-backoff';
import { z } from 'zod';
import { ModelEnum } from '../../utils/modelEnum';
import { getServerSession } from '#auth';

const defaultSystemPrompt = `You are a friendly and helpful assistant working for Svenson.ai.\n`;

async function getSystemPrompt(
  prisma: PrismaClient,
  lang: string,
  assistantId?: string,
) {
  if (prisma && assistantId) {
    try {
      const assistant = await prisma.assistant.findFirst({
        where: {
          id: assistantId.toLowerCase(),
        },
      });
      return assistant?.systemPrompt || defaultSystemPrompt;
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  let prompt = '';
  switch (lang) {
    case 'en':
      prompt = `You are a friendly and helpful assistant working for Svenson.ai.\n
If you are unsure about the answer, say "Sorry, I don't know how to help with that.".\n
Always assist with care, respect, and truth. Respond with utmost utility yet securely. Avoid harmful, unethical, prejudiced, or negative content. Ensure replies promote fairness and positivity.\n`;
      break;
    case 'de':
      prompt = `Du bist ein freundlicher und hilfsbereiter Assistent, der für Svenson.ai arbeitet.\n
Wenn du dir nicht sicher bist, antworte "Entschuldigung, ich weiß nicht, wie ich dir dabei helfen kann.".\n
Hilf immer mit Sorgfalt, Respekt und Wahrheit. Antworte mit größtmöglichem Nutzen, aber sicher. Vermeide schädliche, unethische, voreingenommene oder negative Inhalte. Stelle sicher, dass Antworten Fairness und Positivität fördern.\n`;
      break;
    default:
      prompt = defaultSystemPrompt;
  }
  return prompt;
}

const mRoleRule = z.enum(['user', 'assistant']);
const mContentRule = z.string().min(1).max(1500);
const langRule = z.enum(['en', 'de']);
const modelRule = z
  .string()
  .refine((model) => Object.values(ModelEnum).includes(model as ModelEnum));

const bodySchema = z.object({
  messages: z.array(z.object({ role: mRoleRule, content: mContentRule })),
  model: modelRule,
  lang: langRule,
  assistantId: z.string().toUpperCase().ulid().optional(),
});

export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig();
  const session = await getServerSession(_event);

  let baseURL: string;
  let apiKey: string;
  let model: string;

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
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad request',
    });
  }

  switch (validatedBody.data.model) {
    case ModelEnum.MistralSmall:
      baseURL = config.mistral.baseUrl;
      apiKey = config.mistral.apiKey;
      model = ModelEnum.MistralSmall;
      break;
    case ModelEnum.MistralMedium:
      baseURL = config.mistral.baseUrl;
      apiKey = config.mistral.apiKey;
      model = ModelEnum.MistralMedium;
      break;
    case ModelEnum.Local:
      baseURL = 'http://localhost:5092/v1';
      apiKey = '';
      model = ModelEnum.Local;
      break;
    default:
      baseURL = config.openai.baseUrl;
      apiKey = config.openai.apiKey;
      model = ModelEnum.ChatGPT3;
      break;
  }

  const openai = new OpenAI({
    baseURL,
    apiKey,
  });

  const { prisma } = _event.context;
  const systemPrompt = await getSystemPrompt(
    prisma,
    validatedBody.data.lang,
    validatedBody.data?.assistantId,
  );

  console.log('systemPrompt: ', systemPrompt);

  const response = await backOff(
    () =>
      openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...validatedBody.data.messages,
        ],
        stream: true,
      }),
    {
      jitter: 'full',
      numOfAttempts: 3,
    },
  );

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
    console.log('llmResponseMessage finally: ', llmResponseMessage);
    stream.destroy();
  });

  return sendStream(_event, bufferStream);
});
