import { z } from 'zod';
import { getServerSession } from '#auth';
import { ProviderAuthDto } from '~/server/services/dto/provider-auth.dto';
import { ProviderAuthService } from '~/server/services/provider-auth.service';
import { google } from 'googleapis';
import consola from 'consola';

const logger = consola.create({}).withTag('api.google.drive.get');

const querySchema = z.object({
  search: z.string().max(50).optional(),
  folderId: z.string().max(50).optional(),
  pageToken: z.string().max(512).optional(),
});

const providerAuthService = new ProviderAuthService();

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);
  const authUser = getAuthUser(session); // do not remove this line

  const provider = await providerAuthService.findFirst({
    userId: authUser.id,
    providerName: 'google',
    type: 'googledrive',
  });

  if (!provider || !provider?.accessToken || !provider?.refreshToken) {
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
      // save the new access token
      const payload = ProviderAuthDto.fromInput({
        providerName: 'google',
        type: 'googledrive',
        userId: authUser.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? undefined,
      });
      await providerAuthService.update(payload);
    }
  });

  oauth2Client.setCredentials({
    access_token: provider.accessToken,
    refresh_token: provider.refreshToken,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  let searchFileName = '';
  let searchFolderId = '';
  let pageToken = '';
  const validatedQuery = await getValidatedQuery(_event, (query) =>
    querySchema.safeParse(query),
  );

  if (!validatedQuery.success) {
    logger.error(`invalid query: ${validatedQuery.error}`);
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
