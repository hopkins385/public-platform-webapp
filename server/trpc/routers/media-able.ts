import { cuidRule } from '~/server/utils/validation/ulid.rule';
import { MediaAbleService } from '~/server/services/media-able.service';
import { mediaAbleRule } from '~/server/utils/validation/media-able.rule';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { AttachMediaAbleDto, DetachMediaAbleDto } from '~/server/services/dto/media-able.dto';
import prisma from '~/server/prisma';

const mediaAbleService = new MediaAbleService(prisma);

export const mediaAbleRouter = router({
  attachTo: protectedProcedure
    .input(
      z.object({
        mediaId: cuidRule(),
        model: mediaAbleRule(),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = AttachMediaAbleDto.fromInput({
        mediaId: input.mediaId.toLowerCase(),
        mediaAbleId: input.model.id,
        mediaAbleType: input.model.type,
      });
      return mediaAbleService.attachTo(payload);
    }),

  detachFrom: protectedProcedure
    .input(
      z.object({
        model: mediaAbleRule(),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = DetachMediaAbleDto.fromInput(input.model);
      return mediaAbleService.detachFrom(payload);
    }),

  /*find: protectedProcedure
    .input(
      z.object({
        mediaId: cuidRule(),
      }),
    )
    .query(async ({ input }) => {
      return mediaAbleService.findFirst(input.mediaId);
    }),

  findAllFor: protectedProcedure
    .input(
      z.object({
        model: mediaAbleRule(),
      }),
    )
    .query(async ({ input }) => {
      const model = MediaAbleDto.fromInput(input.model);
      return mediaAbleService.findAllFor(model);
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
      return mediaAbleService.paginateFindAllFor(payload, page);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        mediaId: cuidRule(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return mediaAbleService.delete(input.mediaId);
    }),
    */
});
