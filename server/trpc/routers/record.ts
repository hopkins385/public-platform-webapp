import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { RecordService } from '~/server/services/record.service';
import { CreateRecordDto } from '~/server/services/dto/record.dto';

const recordService = new RecordService();

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
        ...input,
        teamId: ctx.user.teamId,
      });
      return recordService.create(payload);
    }),
});
