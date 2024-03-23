import { z } from 'zod';
import type { H3Event } from 'h3';
import { EditorActionEnum } from '../enums/editorActionEnum';

const bodySchema = z.object({
  lang: z.enum(['en', 'de']),
  action: z.string().refine((action) => {
    return Object.values(EditorActionEnum).includes(action as EditorActionEnum);
  }),
  selectedText: z.string(),
  fullText: z.string(),
  prompt: z.string(),
});

export async function getEditorCompletionBody(event: H3Event) {
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
