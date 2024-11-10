import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { CreateRecordDto, FindRecordsDto } from '~/server/services/dto/record.dto';

export const recordRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        collectionId: cuidRule(),
        mediaId: cuidRule(),
      }),
    )
    .mutation(async ({ input, ctx: { user, services } }) => {
      const payload = CreateRecordDto.fromInput({
        collectionId: input.collectionId,
        mediaId: input.mediaId,
        teamId: user.teamId,
      });

      return await services.recordService.create(payload);
    }),

  findAllPaginated: protectedProcedure
    .input(
      z.object({
        collectionId: cuidRule(),
        page: z.number().default(1).optional(),
        limit: z.number().default(10).optional(),
      }),
    )
    .query(async ({ input, ctx: { user, services } }) => {
      const payload = FindRecordsDto.fromInput({
        collectionId: input.collectionId,
        teamId: user.teamId,
      });
      return await services.recordService.findAllPaginated(payload, input.page, input.limit);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        recordId: cuidRule(),
      }),
    )
    .mutation(async ({ input, ctx: { user, services } }) => {
      return await services.recordService.delete({
        teamId: user.teamId,
        recordId: input.recordId,
      });
    }),
});
