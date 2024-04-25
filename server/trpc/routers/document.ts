import { DocumentService } from './../../services/document.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
} from '~/server/services/dto/document.dto';

export const documentRouter = router({
  // create document
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        status: z.string(),
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const documentService = new DocumentService(ctx.prisma);
      const payload = CreateDocumentDto.fromRequest(input);
      return documentService.create(payload);
    }),
  // find document
  find: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const documentService = new DocumentService(ctx.prisma);
      return documentService.findFirst(input.documentId);
    }),
  // find all documents
  findAll: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
      }),
    )
    .query(({ input, ctx }) => {
      const documentService = new DocumentService(ctx.prisma);
      return documentService.findMany();
    }),
  // update document
  update: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        name: z.string(),
        description: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const documentService = new DocumentService(ctx.prisma);
      const payload = UpdateDocumentDto.fromRequest(input);
      return documentService.update(payload);
    }),
  // delete document
  delete: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const documentService = new DocumentService(ctx.prisma);
      return documentService.softDelete(input.documentId);
    }),
  parse: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const documentService = new DocumentService(ctx.prisma);
      return documentService.parse(input.documentId);
    }),
});
