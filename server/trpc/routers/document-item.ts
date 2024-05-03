import { DocumentItemService } from './../../services/document-item.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ulidRule } from '~/server/utils/validation/ulid.rule';
import {
  CreateDocumentItemDto,
  UpdateDocumentItemDto,
} from '~/server/services/dto/document-item.dto';

const documentItemService = new DocumentItemService();

export const documentItemRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        documentId: ulidRule(),
        orderColumn: z.number(),
        status: z.string(),
        type: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = CreateDocumentItemDto.fromInput(input);
      return documentItemService.create(payload);
    }),
  createMany: protectedProcedure
    .input(
      z.array(
        z.object({
          documentId: ulidRule(),
          orderColumn: z.number(),
          status: z.string(),
          type: z.string(),
          content: z.string(),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      const payload = input.map((item) =>
        CreateDocumentItemDto.fromInput(item),
      );
      return documentItemService.createMany(payload);
    }),
  find: protectedProcedure
    .input(
      z.object({
        documentItemId: ulidRule(),
      }),
    )
    .query(async ({ input }) => {
      return documentItemService.findFirst(input.documentItemId.toLowerCase());
    }),
  findMany: protectedProcedure
    .input(
      z.object({
        documentId: ulidRule(),
      }),
    )
    .query(async ({ input }) => {
      return documentItemService.findMany(input.documentId.toLowerCase());
    }),
  update: protectedProcedure
    .input(
      z.object({
        documentItemId: ulidRule(),
        orderColumn: z.number(),
        status: z.string(),
        type: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = UpdateDocumentItemDto.fromInput(input);
      return documentItemService.update(payload);
    }),
  updateMany: protectedProcedure
    .input(
      z.array(
        z.object({
          documentItemId: ulidRule(),
          orderColumn: z.number(),
          status: z.string(),
          type: z.string(),
          content: z.string(),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      const payload = input.map((item) =>
        UpdateDocumentItemDto.fromInput(item),
      );
      return documentItemService.updateMany(payload);
    }),
  delete: protectedProcedure
    .input(
      z.object({
        documentItemId: ulidRule(),
      }),
    )
    .mutation(async ({ input }) => {
      return documentItemService.softDelete(input.documentItemId.toLowerCase());
    }),
});
