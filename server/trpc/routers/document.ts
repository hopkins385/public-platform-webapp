import { DocumentService } from './../../services/document.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { CreateDocumentDto, FindAllDocumentsDto, UpdateDocumentDto } from '~/server/services/dto/document.dto';
import prisma from '~/server/prisma';

const documentService = new DocumentService(prisma);

export const documentRouter = router({
  // create document
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        status: z.string(),
        projectId: cuidRule(),
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
        projectId: cuidRule(),
        documentId: cuidRule(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return documentService.findFirst(input.projectId.toLowerCase(), input.documentId.toLowerCase());
    }),
  // find all documents
  findAll: protectedProcedure
    .input(
      z.object({
        projectId: cuidRule(),
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
        documentId: cuidRule(),
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
        documentId: cuidRule(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return documentService.softDelete(input.documentId.toLowerCase());
    }),
  parse: protectedProcedure
    .input(
      z.object({
        documentId: cuidRule(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return documentService.parse(input.documentId.toLowerCase());
    }),
});
