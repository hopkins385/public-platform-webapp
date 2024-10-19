import { readFiles } from 'h3-formidable';
import type { Options as FormidableOptions } from 'formidable';
import { getServerSession } from '#auth';
import { getAuthUser } from '~/server/utils/auth/permission';
import consola from 'consola';
import { UploadFiletDto } from '~/server/services/dto/file.dto';
import { services } from '~/server/service-instances';

const logger = consola.create({}).withTag('api.upload.post');

export default defineEventHandler(async (_event) => {
  // Needs Auth
  const session = await getServerSession(_event);
  const user = getAuthUser(session); // do not remove this line

  const options = {
    includeFields: true,
    multiples: true,
    maxFiles: 10,
    maxFilesSize: 5 * 1024 * 1024,
    maxFields: 8,
    // TODO: add filter for file types
    // filter: ({ name, originalFilename, mimetype }) => {
    //   return mimetype && (mimetype.includes('pdf') || mimetype.includes('plain'));
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

    //if vision then store external
    const vision = Boolean(fields.vision?.[0] === 'true');

    const medias = [];
    let createMediaPayload;

    for (const file of files.clientFiles) {
      const uploadPayload = UploadFiletDto.fromInput({
        file,
        userId: user.id,
        teamId: user.teamId, // TODO: fix typescript error
      });
      if (vision) {
        createMediaPayload = await services.storageService.uploadFileToBucket('images', uploadPayload);
      } else {
        createMediaPayload = await services.storageService.uploadFile(uploadPayload);
      }
      const media = await services.mediaService.create(createMediaPayload);
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
