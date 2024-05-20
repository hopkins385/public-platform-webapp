import { z } from 'zod';
import type { H3Event } from 'h3';
import consola from 'consola';

const logger = consola.create({}).withTag('chatConversationBody');

// TODO: Fix model validation !!!
const modelRule = z.string();
// .refine((model) => Object.values(ModelEnum).includes(model as ModelEnum));

const bodySchema = z.object({
  messages: z.array(ChatMessageRule()),
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
    logger.error('Invalid request body', result.error);
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid request body',
    });
  }

  return result.data;
}
