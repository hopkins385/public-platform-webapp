import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { RecordService } from '~/server/services/record.service';
import { CreateRecordDto, FindRecordsDto } from '~/server/services/dto/record.dto';

const prisma = getPrismaClient();
const recordService = new RecordService(prisma);

export const recordRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        collectionId: ulidRule(),
        mediaId: ulidRule(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const payload = CreateRecordDto.fromInput({
        collectionId: input.collectionId,
        mediaId: input.mediaId,
        teamId: ctx.user.teamId,
      });
      return recordService.create(payload);
    }),

  findAllPaginated: protectedProcedure
    .input(
      z.object({
        collectionId: ulidRule(),
        page: z.number().default(1).optional(),
        limit: z.number().default(10).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const payload = FindRecordsDto.fromInput({
        collectionId: input.collectionId,
        teamId: ctx.user.teamId,
      });
      return recordService.findAllPaginated(payload, input.page, input.limit);
    }),
});
