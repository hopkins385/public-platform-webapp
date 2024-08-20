import { DocumentItemService } from './../../services/document-item.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { cuidRule } from '~/server/utils/validation/ulid.rule';
import { CreateDocumentItemDto, UpdateDocumentItemDto } from '~/server/services/dto/document-item.dto';
import prisma from '~/server/prisma';

const documentItemService = new DocumentItemService(prisma);

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
    .mutation(async ({ input }) => {
      const payload = CreateDocumentItemDto.fromInput(input);
      return await documentItemService.create(payload);
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
    .mutation(async ({ input }) => {
      const payload = input.map((item) => CreateDocumentItemDto.fromInput(item));
      return await documentItemService.createMany(payload);
    }),
  find: protectedProcedure
    .input(
      z.object({
        documentItemId: cuidRule(),
      }),
    )
    .query(async ({ input }) => {
      return await documentItemService.findFirst(input.documentItemId.toLowerCase());
    }),
  findMany: protectedProcedure
    .input(
      z.object({
        documentId: cuidRule(),
      }),
    )
    .query(async ({ input }) => {
      return await documentItemService.findMany(input.documentId.toLowerCase());
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
    .mutation(async ({ input }) => {
      const payload = UpdateDocumentItemDto.fromInput(input);
      return await documentItemService.update(payload);
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
    .mutation(async ({ input }) => {
      const payload = input.map((item) => UpdateDocumentItemDto.fromInput(item));
      return await documentItemService.updateMany(payload);
    }),
  delete: protectedProcedure
    .input(
      z.object({
        documentItemId: cuidRule(),
      }),
    )
    .mutation(async ({ input }) => {
      return await documentItemService.softDelete(input.documentItemId.toLowerCase());
    }),
});
