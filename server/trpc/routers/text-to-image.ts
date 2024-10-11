import { cuidRule } from './../../utils/validation/ulid.rule';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { FluxProInputsSchema } from '~/server/schemas/fluxPro.schema';
import { TRPCError } from '@trpc/server';

const enoughCreditsPolicy = (user: any, requiredCredits: number) => {
  if (user.credits < requiredCredits) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have enough credits',
    });
  }
};

const canAccessProjectPolicy = (user: any, projectId: string) => {
  if (!user.projectIds.includes(projectId)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this project',
    });
  }
};

export const textToImageRouter = router({
  // generate images
  generateImages: protectedProcedure
    .input(FluxProInputsSchema)
    .query(async ({ ctx: { user, services, emitEvent }, input }) => {
      // has enough credits
      const requiredCredits = input.imgCount * 15;
      enoughCreditsPolicy(user, requiredCredits);

      const imageUrls = await services.textToImageService.generateFluxProImages(user, input);
      emitEvent(UsageEvent.UPDATE_CREDITS, { userId: user.id, credits: requiredCredits });
      return imageUrls;
    }),
  // get first folder in a project
  getFirstFolderId: protectedProcedure
    .input(
      z.object({
        projectId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      // check if user has access to the project
      canAccessProjectPolicy(user, input.projectId);

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
  // get all images in a folder
  getFolderImagesRuns: protectedProcedure
    .input(
      z.object({
        projectId: cuidRule(),
        folderId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      // check if user has access to the project
      canAccessProjectPolicy(user, input.projectId);
      return await services.textToImageService.getFolderImagesRuns(input.folderId);
    }),
  deleteRun: protectedProcedure
    .input(
      z.object({
        projectId: cuidRule(),
        runId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      // check if user has access to the project
      canAccessProjectPolicy(user, input.projectId);
      const res = await services.textToImageService.softDeleteRun(input.runId);
      return { success: true, runId: input.runId };
    }),
});
