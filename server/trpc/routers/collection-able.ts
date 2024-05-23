import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import {
  AttachCollectionAbleDto,
  DetachAllCollectionAbleDto,
  DetachCollectionAbleDto,
} from '~/server/services/dto/collection-able.dto';
import { CollectionAbleService } from '~/server/services/collection-able.service';

const prisma = getPrismaClient();
const collectionAbleService = new CollectionAbleService(prisma);

export const collectionAbleRouter = router({
  attachTo: protectedProcedure
    .input(
      z.object({
        model: collectionAbleRule(),
        collectionId: ulidRule(),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = AttachCollectionAbleDto.fromInput(input);
      return collectionAbleService.attachTo(payload);
    }),

  detachFrom: protectedProcedure
    .input(
      z.object({
        model: collectionAbleRule(),
        collectionId: ulidRule(),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = DetachCollectionAbleDto.fromInput(input);
      return collectionAbleService.detachFrom(payload);
    }),

  detachAllFrom: protectedProcedure
    .input(
      z.object({
        model: collectionAbleRule(),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = DetachAllCollectionAbleDto.fromInput(input);
      return collectionAbleService.detachAllFrom(payload);
    }),

  replaceTo: protectedProcedure
    .input(
      z.object({
        model: collectionAbleRule(),
        collectionId: ulidRule(),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = AttachCollectionAbleDto.fromInput(input);
      return collectionAbleService.replaceTo(payload);
    }),
});
