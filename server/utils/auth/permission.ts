import type { User } from 'next-auth';

export function getAuthUser(session: any): User {
  const user = session?.user;

  if (!user || !user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  return user;
}
