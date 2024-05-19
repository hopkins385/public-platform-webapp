import { readFiles } from 'h3-formidable';
import type { Options as FormidableOptions } from 'formidable';
import { getServerSession } from '#auth';
import { getAuthUser } from '~/server/utils/auth/permission';
import { MediaService } from '~/server/services/media.service';
import { StorageService } from '~/server/services/storage.service';
import consola from 'consola';

const storageService = new StorageService();
const mediaService = new MediaService();

const logger = consola.create({}).withTag('api.upload.post');

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);
  const user = getAuthUser(session); // do not remove this line

  const options = {
    includeFields: true,
    multiples: true,
    maxFiles: 10,
    maxFilesSize: 5 * 1024 * 1024,
    maxFields: 8,
    // TODO: add filter for file types
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

    const medias = [];

    for (const file of files.clientFiles) {
      const payload = await storageService.uploadFileToBucket(
        file,
        user.id,
        user.teamId, // TODO: fix typescript error
      );
      const media = await mediaService.create(payload);
      medias.push(media);
    }

    // return medias;
    return medias.map((media) => {
      return {
        id: media.id,
        path: media.filePath,
        name: media.name,
      };
    });
    //
  } catch (error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'An error occurred while uploading the file(s)',
    });
  }
});
