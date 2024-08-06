import { ProviderAuthService } from './../../services/provider-auth.service';
import { google } from 'googleapis';
import { z } from 'zod';
import { getServerSession } from '#auth';
import { ProviderAuthDto } from '~/server/services/dto/provider-auth.dto';
import prisma from '~/server/prisma';

const providerAuthService = new ProviderAuthService(prisma);

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

  const result = await getValidatedQuery(_event, (query) => codeSchema.safeParse(query));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'code is required',
    });
  }

  const oauth2Client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);

  const { code } = result.data;
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens || !tokens.access_token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'invalid tokens',
    });
  }

  const payload = ProviderAuthDto.fromInput({
    providerName: 'google',
    type: 'googledrive',
    userId: session.user.id,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? undefined,
  });

  const res = await providerAuthService.create(payload);

  if (!res) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save provider auth',
    });
  }

  await sendRedirect(_event, '/media/google', 302);

  return { success: true };
});
