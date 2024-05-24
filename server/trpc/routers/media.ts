import { mediaAbleRule } from '~/server/utils/validation/media-able.rule';
import { MediaService } from '~/server/services/media.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { MediaAbleDto } from '~/server/services/dto/media-able.dto';

const prisma = getPrismaClient();
const mediaService = new MediaService(prisma);

export const mediaRouter = router({
  find: protectedProcedure
    .input(
      z.object({
        mediaId: ulidRule(),
      }),
    )
    .query(async ({ input }) => {
      return await mediaService.findFirst(input.mediaId);
    }),

  findAllFor: protectedProcedure
    .input(
      z.object({
        model: mediaAbleRule(),
      }),
    )
    .query(async ({ input }) => {
      const model = MediaAbleDto.fromInput(input.model);
      return await mediaService.findAllFor(model);
    }),

  paginateFindAllFor: protectedProcedure
    .input(
      z.object({
        model: mediaAbleRule(),
        page: z.number().default(1),
        limit: z.number().default(10).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { limit, page, model } = input;
      const payload = MediaAbleDto.fromInput(model);
      return await mediaService.paginateFindAllFor(payload, page, limit);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        mediaId: ulidRule(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await mediaService.delete(input.mediaId);
    }),
});
