import { z } from 'zod';
import type { H3Event } from 'h3';

// content can be either a string or an array such as
// [{ type: 'image_url', image_url: { url: string, detail: 'low' | 'high' | 'auto' } },
// { type: 'text', text: string }]

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  message: ChatMessageRule(),
});

const modelRule = z.string();
// .refine((model) => Object.values(ModelEnum).includes(model as ModelEnum));

const bodySchema = z.object({
  messages: z.any(),
  model: modelRule,
  lang: langRule(),
  chatId: ulidRule(),
  maxTokens: z.number().int().gte(0),
  temperature: z.number().gte(0).lte(1),
  // presencePenalty: z.number().gte(-2).lte(2),
});

export async function getConversationBody(event: H3Event) {
  const result = await readValidatedBody(event, (body) => {
    console.log('body', body);
    return bodySchema.safeParse(body);
  });

  if (!result.success) {
    console.log('result.error', result.error);
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: JSON.stringify(result.error.issues),
    });
  }

  return result.data;
}
