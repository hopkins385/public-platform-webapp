// server/api/index.post.js
import fs from 'fs';
import path from 'path';
import { readFiles } from 'h3-formidable';
import type { Options as FormidableOptions } from 'formidable';
import { getServerSession } from '#auth';

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);

  if (!session?.user || !session.user.id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    });
  }

  if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync(path.join('public', 'uploads'));
  }

  if (!fs.existsSync(`public/uploads/${session.user.id}`)) {
    fs.mkdirSync(path.join('public', 'uploads', session.user.id));
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
        statusCode: 500,
        statusMessage: 'Client file(s) not found',
      });
    }

    for (const file of files.clientFiles) {
      const mimeType =
        file.mimetype?.split('/')[1] !== 'plain'
          ? file.mimetype?.split('/')[1]
          : 'txt';
      const fileName = `${Date.now()}-${file.newFilename}.${mimeType}`;
      const newPath = `${path.join('public', 'uploads', session.user.id, fileName)}`;
      fs.copyFileSync(file.filepath, newPath);
    }

    return { success: true };
    //
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error?.message,
    });
  }
});
