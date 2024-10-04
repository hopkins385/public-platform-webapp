import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import {
  AttachCollectionAbleDto,
  DetachAllCollectionAbleDto,
  DetachCollectionAbleDto,
} from '~/server/services/dto/collection-able.dto';

export const collectionAbleRouter = router({
  attachTo: protectedProcedure
    .input(
      z.object({
        model: collectionAbleRule(),
        collectionId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      const payload = AttachCollectionAbleDto.fromInput(input);
      return await services.collectionAbleService.attachTo(payload);
    }),

  detachFrom: protectedProcedure
    .input(
      z.object({
        model: collectionAbleRule(),
        collectionId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      const payload = DetachCollectionAbleDto.fromInput(input);
      return await services.collectionAbleService.detachFrom(payload);
    }),

  detachAllFrom: protectedProcedure
    .input(
      z.object({
        model: collectionAbleRule(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      const payload = DetachAllCollectionAbleDto.fromInput(input);
      return await services.collectionAbleService.detachAllFrom(payload);
    }),

  replaceTo: protectedProcedure
    .input(
      z.object({
        model: collectionAbleRule(),
        collectionId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      const payload = AttachCollectionAbleDto.fromInput(input);
      return await services.collectionAbleService.replaceTo(payload);
    }),
});
