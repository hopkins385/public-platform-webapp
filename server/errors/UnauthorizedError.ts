// server/errors/UnauthorizedError.ts

export function UnauthorizedError() {
  return createError({
    name: 'UnauthorizedError',
    message: 'User not authenticated',
    statusCode: 401,
    statusMessage: 'Unauthorized',
  });
}
