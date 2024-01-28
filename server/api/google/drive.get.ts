import { google } from 'googleapis';
import type { User } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from '#auth';
import { UserService } from '~/server/services/user.service';

const querySchema = z.object({
  search: z.string().max(50).optional(),
  folderId: z.string().max(50).optional(),
  pageToken: z.string().max(512).optional(),
});

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const { prisma } = _event.context;

  let user: Partial<User> | null = null;
  user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      googleAccessToken: true,
      googleRefreshToken: true,
    },
  });

  if (!user || !user?.googleAccessToken || !user?.googleRefreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid auth tokens',
    });
  }

  const config = useRuntimeConfig().google;
  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUrl,
  );

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens && tokens.access_token) {
      const userService = new UserService(prisma);
      user = await userService.updateGoogleAuthTokens(session.user.id, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? undefined,
      });
    }
  });

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  let searchFileName = '';
  let searchFolderId = '';
  let pageToken: '';
  const validatedQuery = await getValidatedQuery(_event, (query) =>
    querySchema.safeParse(query),
  );

  if (!validatedQuery.success) {
    console.log('invalid query', validatedQuery.error);
    searchFileName = '';
    searchFolderId = '';
    pageToken = '';
  } else {
    searchFileName = validatedQuery.data.search ?? '';
    searchFolderId = validatedQuery.data.folderId ?? '';
    pageToken = validatedQuery.data.pageToken ?? '';
  }

  const getSearchQuery = (fileName: string, folderId: string) => {
    const query = `mimeType='application/vnd.google-apps.folder' and "root" in parents`;
    if (fileName !== '') {
      return `name contains "${fileName}"`;
    } else if (folderId !== '') {
      return `"${folderId}" in parents`;
    } else {
      return query + ' and trashed=false';
    }
  };

  const result = await drive.files.list({
    q: getSearchQuery(searchFileName, searchFolderId),
    pageToken,
    orderBy: 'folder, name_natural asc',
    pageSize: 20,
    fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size)',
    spaces: 'drive',
  });

  return {
    data: result.data,
  };
});
