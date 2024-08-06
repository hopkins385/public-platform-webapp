import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AssistantService } from '~/server/services/assistant.service';
import {
  CreateAssistantDto,
  DeleteAssistantDto,
  FindAllAssistantsDto,
  FindAssistantDto,
  UpdateAssistantDto,
} from '~/server/services/dto/assistant.dto';
import { ulidRule } from '~/server/utils/validation/ulid.rule';
import prisma from '~/server/prisma';

const assistantService = new AssistantService(prisma);

export const assistantRouter = router({
  // create assistant
  create: protectedProcedure
    .input(
      z.object({
        teamId: ulidRule(),
        llmId: ulidRule(),
        title: z.string(),
        description: z.string(),
        systemPrompt: z.string(),
        isShared: z.boolean().default(false).optional(),
        systemPromptTokenCount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const payload = CreateAssistantDto.fromInput(input);

      // policy check
      assistantService.canCreateAssistantPolicy(payload, ctx.user);

      return await assistantService.create(payload);
    }),
  // get assistant by id
  one: protectedProcedure
    .input(
      z.object({
        id: ulidRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const payload = FindAssistantDto.fromInput(input);
      const assistant = await assistantService.findFirst(payload);

      if (!assistant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assistant not found',
        });
      }

      // console.log(assistant);

      // policy check
      assistantService.canAccessAssistantPolicy(assistant, ctx.user);

      return assistant;
    }),
  // get all assistants
  all: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        searchQuery: z.string().max(255).optional(),
      }),
    )
    .query(({ ctx, input }) => {
      const payload = FindAllAssistantsDto.fromInput(ctx.user.teamId, input.page, input.searchQuery);

      return assistantService.findAll(payload);
    }),
  // update assistant by id
  update: protectedProcedure
    .input(
      z.object({
        teamId: ulidRule(),
        llmId: ulidRule(),
        id: ulidRule(),
        title: z.string(),
        description: z.string(),
        systemPrompt: z.string(),
        isShared: z.boolean().optional(),
        systemPromptTokenCount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const payload = UpdateAssistantDto.fromInput(input);

      // policy check
      await assistantService.canUpdateAssistantPolicy(payload, ctx.user);

      return await assistantService.update(payload);
    }),
  // delete assistant by id
  delete: protectedProcedure
    .input(
      z.object({
        teamId: ulidRule(),
        id: ulidRule(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletePayload = DeleteAssistantDto.fromInput(input);

      // policy check
      await assistantService.canDeleteAssistantPolicy(deletePayload, ctx.user);

      return await assistantService.softDelete(deletePayload);
    }),
});
