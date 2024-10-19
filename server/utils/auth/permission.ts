import type { SessionUser } from '~/server/schemas/loginSchema';

export function getAuthUser(session: any): SessionUser {
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const user = session?.user as SessionUser;

  if (!user || !user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  return user;
}
