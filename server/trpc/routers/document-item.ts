import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { cuidRule } from '~/server/utils/validation/ulid.rule';
import { CreateDocumentItemDto, UpdateDocumentItemDto } from '~/server/services/dto/document-item.dto';

export const documentItemRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        documentId: cuidRule(),
        orderColumn: z.number(),
        status: z.string(),
        type: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      const payload = CreateDocumentItemDto.fromInput(input);
      return await services.documentItemService.create(payload);
    }),
  createMany: protectedProcedure
    .input(
      z.array(
        z.object({
          documentId: cuidRule(),
          orderColumn: z.number(),
          status: z.string(),
          type: z.string(),
          content: z.string(),
        }),
      ),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      const payload = input.map((item) => CreateDocumentItemDto.fromInput(item));
      return await services.documentItemService.createMany(payload);
    }),
  find: protectedProcedure
    .input(
      z.object({
        documentItemId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { services }, input }) => {
      return await services.documentItemService.findFirst(input.documentItemId.toLowerCase());
    }),
  findMany: protectedProcedure
    .input(
      z.object({
        documentId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { services }, input }) => {
      return await services.documentItemService.findMany(input.documentId.toLowerCase());
    }),
  update: protectedProcedure
    .input(
      z.object({
        documentItemId: cuidRule(),
        content: z.string(),
        orderColumn: z.number().optional(),
        status: z.string().optional(),
        type: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      const payload = UpdateDocumentItemDto.fromInput(input);
      return await services.documentItemService.update(payload);
    }),
  updateMany: protectedProcedure
    .input(
      z.array(
        z.object({
          documentItemId: cuidRule(),
          orderColumn: z.number(),
          status: z.string(),
          type: z.string(),
          content: z.string(),
        }),
      ),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      const payload = input.map((item) => UpdateDocumentItemDto.fromInput(item));
      return await services.documentItemService.updateMany(payload);
    }),
  delete: protectedProcedure
    .input(
      z.object({
        documentItemId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      return await services.documentItemService.softDelete(input.documentItemId.toLowerCase());
    }),
});
