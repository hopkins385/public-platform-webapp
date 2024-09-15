import { MediaService } from '~/server/services/media.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { RecordService } from '~/server/services/record.service';
import { CreateRecordDto, FindRecordsDto } from '~/server/services/dto/record.dto';
import { VectorService } from '~/server/services/vector.service';
import prisma from '~/server/prisma';
import qdrant from '~/server/qdrant';

const mediaService = new MediaService(prisma);
const vectorService = new VectorService(qdrant);
const recordService = new RecordService(prisma, mediaService, vectorService);

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
