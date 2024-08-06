import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { RecordService } from '~/server/services/record.service';
import { CreateRecordDto, FindRecordsDto } from '~/server/services/dto/record.dto';
import prisma from '~/server/prisma';

const config = useRuntimeConfig();
const recordService = new RecordService(prisma, config);

export const recordRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        collectionId: cuidRule(),
        mediaId: cuidRule(),
      }),
    )
    .mutation(async ({ input, ctx: { user } }) => {
      const payload = CreateRecordDto.fromInput({
        collectionId: input.collectionId,
        mediaId: input.mediaId,
        teamId: user.teamId,
      });
      return recordService.create(payload);
    }),

  findAllPaginated: protectedProcedure
    .input(
      z.object({
        collectionId: cuidRule(),
        page: z.number().default(1).optional(),
        limit: z.number().default(10).optional(),
      }),
    )
    .query(async ({ input, ctx: { user } }) => {
      const payload = FindRecordsDto.fromInput({
        collectionId: input.collectionId,
        teamId: user.teamId,
      });
      return recordService.findAllPaginated(payload, input.page, input.limit);
    }),
});
