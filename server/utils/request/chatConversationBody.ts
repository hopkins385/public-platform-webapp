import { z } from 'zod';
import type { H3Event } from 'h3';

const mMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

const modelRule = z.string();
// .refine((model) => Object.values(ModelEnum).includes(model as ModelEnum));

const bodySchema = z.object({
  messages: z.array(mMessageSchema),
  model: modelRule,
  lang: langRule(),
  chatId: ulidRule(),
  maxTokens: z.number().int().gte(0),
  temperature: z.number().gte(0).lte(1),
  // presencePenalty: z.number().gte(-2).lte(2),
});

export async function getConversationBody(event: H3Event) {
  const result = await readValidatedBody(event, (body) =>
    bodySchema.safeParse(body),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: JSON.stringify(result.error.issues),
    });
  }

  return result.data;
}
