import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { CreateCollectionDto } from '~/server/services/dto/collection.dto';
import { CollectionService } from '~/server/services/collection.service';
import { collectionAbleRule } from '~/server/utils/validation/collection-able.rule';
import { CollectionAbleDto } from '~/server/services/dto/collection-able.dto';
import prisma from '~/server/prisma';

const collectionService = new CollectionService(prisma);

export const collectionRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(255),
        description: z.string().optional().or(z.string().min(3).max(255)),
      }),
    )
    .mutation(async ({ input, ctx: { user } }) => {
      const payload = CreateCollectionDto.fromInput({
        teamId: user.teamId,
        name: input.name,
        description: input.description,
      });
      return collectionService.createCollection(payload);
    }),

  findFirst: protectedProcedure
    .input(
      z.object({
        id: ulidRule(),
      }),
    )
    .query(async ({ input, ctx: { user } }) => {
      return collectionService.findFirst(user.teamId, input.id);
    }),

  findAll: protectedProcedure.query(async ({ ctx: { user } }) => {
    return collectionService.findAll(user.teamId);
  }),

  findAllPaginated: protectedProcedure
    .input(z.object({ page: z.number().int().positive().default(1) }))
    .query(async ({ input, ctx: { user } }) => {
      return collectionService.findAllPaginated(user.teamId, input.page);
    }),

  findAllFor: protectedProcedure
    .input(
      z.object({
        model: collectionAbleRule(),
      }),
    )
    .query(async ({ input }) => {
      const payload = CollectionAbleDto.fromInput(input.model);
      return collectionService.findAllFor(payload);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: ulidRule(),
        name: z.string().min(3).max(255),
        description: z.string().optional().or(z.string().min(3).max(255)),
      }),
    )
    .mutation(async ({ input, ctx: { user } }) => {
      const payload = CreateCollectionDto.fromInput({
        teamId: user.teamId,
        name: input.name,
        description: input.description,
      });
      return collectionService.update(user.teamId, input.id, payload);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: ulidRule(),
      }),
    )
    .mutation(async ({ input, ctx: { user } }) => {
      return collectionService.softDelete(user.teamId, input.id);
    }),
});
