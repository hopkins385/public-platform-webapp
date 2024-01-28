import { google } from 'googleapis';
import { z } from 'zod';
import { UserService } from '~/server/services/user.service';
import { getServerSession } from '#auth';

const codeSchema = z.object({
  code: z.string(),
});

export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig().google;
  const session = await getServerSession(_event);

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const result = await getValidatedQuery(_event, (query) =>
    codeSchema.safeParse(query),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'code is required',
    });
  }

  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUrl,
  );

  const { code } = result.data;
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens || !tokens.access_token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'invalid tokens',
    });
  }

  const { prisma } = _event.context;
  const userService = new UserService(prisma);
  await userService.updateGoogleAuthTokens(session.user.id, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? undefined,
  });

  // redirect to /files/google
  await sendRedirect(_event, '/files/google', 302);

  return { success: true };
});
