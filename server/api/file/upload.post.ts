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
    filter: function ({ name, originalFilename, mimetype }) {
      return mimetype && mimetype.includes('pdf');
    },
  } as FormidableOptions;

  try {
    const { fields, form, files } = await readFiles(_event, options);

    if (!files.clientFiles) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No files found',
      });
    }

    for (const file of files.clientFiles) {
      const fileName = `${Date.now()}-${file.newFilename}.${
        file.mimetype?.split('/')[1]
      }`;
      const newPath = `${path.join('public', 'uploads', session.user.id, fileName)}`;
      fs.copyFileSync(file.filepath, newPath);
    }

    // store file in public/uploads

    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error?.message,
    });
  }
});
