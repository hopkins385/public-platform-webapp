import { DocumentService } from './../../services/document.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  CreateDocumentDto,
  FindAllDocumentsDto,
  UpdateDocumentDto,
} from '~/server/services/dto/document.dto';

const prisma = getPrismaClient();
const documentService = new DocumentService(prisma);

export const documentRouter = router({
  // create document
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        status: z.string(),
        projectId: ulidRule(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const payload = CreateDocumentDto.fromInput(input);
      return documentService.create(payload);
    }),
  // find document
  find: protectedProcedure
    .input(
      z.object({
        projectId: ulidRule(),
        documentId: ulidRule(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return documentService.findFirst(
        input.projectId.toLowerCase(),
        input.documentId.toLowerCase(),
      );
    }),
  // find all documents
  findAll: protectedProcedure
    .input(
      z.object({
        projectId: ulidRule(),
        page: z.number().default(1),
      }),
    )
    .query(({ input, ctx }) => {
      const payload = FindAllDocumentsDto.fromInput(input);
      return documentService.findAll(payload);
    }),
  // update document
  update: protectedProcedure
    .input(
      z.object({
        documentId: ulidRule(),
        name: z.string(),
        description: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const payload = UpdateDocumentDto.fromInput(input);
      return documentService.update(payload);
    }),
  // delete document
  delete: protectedProcedure
    .input(
      z.object({
        documentId: ulidRule(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return documentService.softDelete(input.documentId.toLowerCase());
    }),
  parse: protectedProcedure
    .input(
      z.object({
        documentId: ulidRule(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return documentService.parse(input.documentId.toLowerCase());
    }),
});
