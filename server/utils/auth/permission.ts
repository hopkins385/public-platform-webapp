import type { H3Event } from 'h3';
import { getServerSession } from '#auth';
import type { User } from 'next-auth';

export async function isAuthed(event: H3Event): Promise<boolean> {
  const session = await getServerSession(event);
  return session?.user && session.user.id;
}

export async function getAuthUser(event: H3Event): Promise<null | User> {
  const session = await getServerSession(event);
  const user = session?.user;

  if (!user || !user.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  return user;
}
