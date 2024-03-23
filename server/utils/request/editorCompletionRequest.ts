import { z } from 'zod';
import type { H3Event } from 'h3';

export async function getEditorCompletionBody(event: H3Event) {
  const bodySchema = z.object({
    lang: z.enum(['en', 'de']),
    action: z.string(),
    selectedText: z.string(),
    fullText: z.string(),
    prompt: z.string(),
  });

  const validatedBody = await readValidatedBody(event, (body) =>
    bodySchema.safeParse(body),
  );

  if (!validatedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: JSON.stringify(validatedBody.error),
    });
  }

  return validatedBody.data;
}
