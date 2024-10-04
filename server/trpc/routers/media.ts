import { mediaAbleRule } from '~/server/utils/validation/media-able.rule';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { MediaAbleDto } from '~/server/services/dto/media-able.dto';

export const mediaRouter = router({
  find: protectedProcedure
    .input(
      z.object({
        mediaId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { services }, input }) => {
      return await services.mediaService.findFirst(input.mediaId);
    }),

  findAllFor: protectedProcedure
    .input(
      z.object({
        model: mediaAbleRule(),
      }),
    )
    .query(async ({ ctx: { services }, input }) => {
      const model = MediaAbleDto.fromInput(input.model);
      return await services.mediaService.findAllFor(model);
    }),

  paginateFindAllFor: protectedProcedure
    .input(
      z.object({
        model: mediaAbleRule(),
        page: z.number().default(1),
        limit: z.number().default(10).optional(),
      }),
    )
    .query(async ({ ctx: { services }, input }) => {
      const { limit, page, model } = input;
      const payload = MediaAbleDto.fromInput(model);
      return await services.mediaService.paginateFindAllFor(payload, page, limit);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        mediaId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      return await services.mediaService.delete(input.mediaId);
    }),
});
