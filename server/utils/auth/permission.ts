import type { User } from 'next-auth';
import type { SessionUser } from '~/server/api/auth/[...]';

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
