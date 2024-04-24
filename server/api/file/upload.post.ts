// server/api/index.post.js
import fs from 'fs';
import path from 'path';
import { readFiles } from 'h3-formidable';
import type { Options as FormidableOptions } from 'formidable';
import { getServerSession } from '#auth';
import { getAuthUser } from '~/server/utils/auth/permission';

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);
  const user = getAuthUser(session); // do not remove this line

  if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync(path.join('public', 'uploads'));
  }

  if (!fs.existsSync(`public/uploads/${user.id}`)) {
    fs.mkdirSync(path.join('public', 'uploads', user.id));
  }

  const options = {
    includeFields: true,
    multiples: true,
    maxFiles: 10,
    maxFilesSize: 5 * 1024 * 1024,
    maxFields: 8,
    // filter: function ({ name, originalFilename, mimetype }) {
    //   return mimetype && mimetype.includes('pdf') && mimetype.includes('plain');
    // },
  } as FormidableOptions;

  try {
    const { fields, form, files } = await readFiles(_event, options);

    if (!files.clientFiles) {
      throw createError({
        statusCode: 406,
        statusMessage: 'Not Acceptable',
        message: 'Client file(s) cannot be empty.',
      });
    }

    for (const file of files.clientFiles) {
      const mimeType =
        file.mimetype?.split('/')[1] !== 'plain'
          ? file.mimetype?.split('/')[1]
          : 'txt';
      const fileName = `${Date.now()}-${file.newFilename}.${mimeType}`;
      const newPath = `${path.join('public', 'uploads', user.id, fileName)}`;
      fs.copyFileSync(file.filepath, newPath);
    }

    return { success: true };
    //
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'An error occurred while uploading the file(s)',
    });
  }
});
