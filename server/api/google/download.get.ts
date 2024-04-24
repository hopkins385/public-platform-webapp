import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import { google } from 'googleapis';
import { z } from 'zod';
import type { User } from '@prisma/client';
import { UserService } from '~/server/services/user.service';
import { getServerSession } from '#auth';

const fileSchema = z.object({
  fileId: z.string(),
});

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);
  const authUser = getAuthUser(session); // do not remove this line

  const { prisma } = _event.context;

  let user: Partial<User> | null = null;
  user = await prisma.user.findUnique({
    where: {
      id: authUser.id,
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
      user = await userService.updateGoogleAuthTokens(authUser.id, {
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

  const validatedQuery = await getValidatedQuery(_event, (query) =>
    fileSchema.safeParse(query),
  );

  if (!validatedQuery.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    });
  }

  if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync(path.join('public', 'uploads'));
  }

  if (!fs.existsSync(path.join('public', 'uploads', authUser.id))) {
    fs.mkdirSync(path.join('public', 'uploads', authUser.id));
  }

  // get file metadata from google drive
  const file = await drive.files.get({
    fileId: validatedQuery.data.fileId,
    fields: 'id, name, fileExtension, fullFileExtension',
  });

  if (!file.data || !file.data.name) {
    throw createError({
      statusCode: 404,
      statusMessage: 'File not found',
    });
  }

  const fileNameMd5 = crypto
    .createHash('md5')
    .update(file.data.name)
    .digest('hex');

  const newFilename = `${Date.now().toString()}-${fileNameMd5}.${file.data.fileExtension}`;

  const newPath = `${path.join('public', 'uploads', authUser.id, newFilename)}`;

  // save file to public/uploads
  const writer = fs.createWriteStream(newPath);

  const res = await drive.files.get(
    {
      fileId: validatedQuery.data.fileId,
      alt: 'media',
    },
    { responseType: 'stream' },
  );
  res.data
    ?.on('end', () => {
      console.log('Done');
    })
    .on('error', (err) => {
      console.log('Error', err);
    })
    .pipe(writer);

  return {
    success: true,
  };
});
