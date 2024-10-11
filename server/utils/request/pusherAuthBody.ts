import type { H3Event } from 'h3';
import { z } from 'zod';

const pusherAuthBodySchema = z.object({
  socket_id: z.string(),
  channel_name: z.string(),
});

const pusherUserAuthBodySchema = z.object({
  socket_id: z.string(),
});

export async function getPusherAuthBody(event: H3Event) {
  const result = await readValidatedBody(event, (body) => pusherAuthBodySchema.safeParse(body));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid request body',
    });
  }

  return result.data;
}

export async function getPusherUserAuthBody(event: H3Event) {
  const result = await readValidatedBody(event, (body) => pusherUserAuthBodySchema.safeParse(body));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid request body',
    });
  }

  return result.data;
}
