import { cuidRule } from './../../utils/validation/ulid.rule';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { FluxProInputsSchema } from '~/server/schemas/fluxPro.schema';

export const textToImageRouter = router({
  generateImages: protectedProcedure.input(FluxProInputsSchema).query(async ({ ctx: { user, services }, input }) => {
    return await services.textToImageService.generateImages(input);
  }),
  getFirstFolderId: protectedProcedure
    .input(
      z.object({
        projectId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      // TODO: access policy if user has access to the project
      const folders = await services.textToImageService.findFolders({ projectId: input.projectId });
      if (folders.length === 0) {
        console.log('This project has no ai-image folders, creating one ... ');
        const folder = await services.textToImageService.createFolder({
          projectId: input.projectId,
          folderName: 'Default',
        });
        return { folderId: folder.id };
      }
      const folder = folders[0];
      return { folderId: folder.id };
    }),
});
