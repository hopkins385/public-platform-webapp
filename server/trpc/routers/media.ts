import { mediaAbleRule } from './../../utils/validation/media-able.rule';
import { MediaService } from './../../services/media.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { MediaAbleDto } from '~/server/services/dto/media-able.dto';

const mediaService = new MediaService();

export const mediaRouter = router({
  find: protectedProcedure
    .input(
      z.object({
        mediaId: ulidRule(),
      }),
    )
    .query(async ({ input }) => {
      return mediaService.findFirst(input.mediaId);
    }),

  findAllFor: protectedProcedure
    .input(
      z.object({
        model: mediaAbleRule(),
      }),
    )
    .query(async ({ input }) => {
      const model = MediaAbleDto.fromInput(input.model);
      return mediaService.findAllFor(model);
    }),

  paginateFindAllFor: protectedProcedure
    .input(
      z.object({
        model: mediaAbleRule(),
        page: z.number().default(1),
      }),
    )
    .query(async ({ input }) => {
      const { page, model } = input;
      const payload = MediaAbleDto.fromInput(model);
      return mediaService.paginateFindAllFor(payload, page);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        mediaId: ulidRule(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return mediaService.delete(input.mediaId);
    }),
});
