import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { CreateCollectionDto } from '~/server/services/dto/collection.dto';
import { CollectionService } from '~/server/services/collection.service';

const collectionService = new CollectionService();

export const collectionRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(255),
        description: z.string().optional().or(z.string().min(3).max(255)),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const payload = CreateCollectionDto.fromInput({
        teamId: ctx.user.teamId,
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
    .query(async ({ input, ctx }) => {
      return collectionService.findFirst(ctx.user.teamId, input.id);
    }),

  findAll: protectedProcedure.query(async ({ ctx }) => {
    return collectionService.findAll(ctx.user.teamId);
  }),

  findAllPaginated: protectedProcedure
    .input(z.object({ page: z.number().int().positive().default(1) }))
    .query(async ({ input, ctx }) => {
      return collectionService.findAllPaginated(ctx.user.teamId, input.page);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: ulidRule(),
        name: z.string().min(3).max(255),
        description: z.string().optional().or(z.string().min(3).max(255)),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const payload = CreateCollectionDto.fromInput({
        teamId: ctx.user.teamId,
        name: input.name,
        description: input.description,
      });
      return collectionService.update(ctx.user.teamId, input.id, payload);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: ulidRule(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return collectionService.softDelete(ctx.user.teamId, input.id);
    }),
});
