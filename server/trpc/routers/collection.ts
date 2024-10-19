import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { CreateCollectionDto } from '~/server/services/dto/collection.dto';
import { collectionAbleRule } from '~/server/utils/validation/collection-able.rule';
import { CollectionAbleDto } from '~/server/services/dto/collection-able.dto';
import { CollectionNotFoundError } from '../errors/collectionNotFoundError';

export const collectionRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(255),
        description: z.string().optional().or(z.string().min(3).max(255)),
      }),
    )
    .mutation(async ({ input, ctx: { user, services } }) => {
      return await services.collectionService.createCollection(
        CreateCollectionDto.fromInput({
          teamId: user.teamId,
          name: input.name,
          description: input.description,
        }),
      );
    }),

  findFirst: protectedProcedure
    .input(
      z.object({
        id: cuidRule(),
      }),
    )
    .query(async ({ input, ctx: { user, services } }) => {
      return await services.collectionService.findFirst(user.teamId, input.id);
    }),

  findAll: protectedProcedure.query(async ({ ctx: { user, services } }) => {
    return await services.collectionService.findAll(user.teamId);
  }),

  findAllPaginated: protectedProcedure
    .input(z.object({ page: z.number().int().positive().default(1) }))
    .query(async ({ input, ctx: { user, services } }) => {
      return await services.collectionService.findAllPaginated(user.teamId, input.page);
    }),

  findAllFor: protectedProcedure
    .input(
      z.object({
        model: collectionAbleRule(),
      }),
    )
    .query(async ({ ctx: { services }, input }) => {
      const payload = CollectionAbleDto.fromInput(input.model);
      return await services.collectionService.findAllFor(payload);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: cuidRule(),
        name: z.string().min(3).max(255),
        description: z.string().optional().or(z.string().min(3).max(255)),
      }),
    )
    .mutation(async ({ input, ctx: { user, services } }) => {
      // find the collection
      const collection = await services.collectionService.findFirst(user.teamId, input.id);

      if (!collection) {
        throw new CollectionNotFoundError();
      }

      return await services.collectionService.update(
        user.teamId,
        input.id,
        CreateCollectionDto.fromInput({
          teamId: user.teamId,
          name: input.name,
          description: input.description,
        }),
      );
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: cuidRule(),
      }),
    )
    .mutation(async ({ input, ctx: { user, services } }) => {
      // find the collection
      const collection = await services.collectionService.findFirst(user.teamId, input.id);

      if (!collection) {
        throw new CollectionNotFoundError();
      }

      return await services.collectionService.softDelete(user.teamId, input.id);
    }),
});
