import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  CreateAssistantDto,
  DeleteAssistantDto,
  FindAllAssistantsDto,
  FindAssistantDto,
  UpdateAssistantDto,
} from '~/server/services/dto/assistant.dto';
import { idSchema, cuidRule } from '~/server/utils/validation/ulid.rule';

export const assistantRouter = router({
  // create assistant
  create: protectedProcedure
    .input(
      z.object({
        teamId: cuidRule(),
        llmId: cuidRule(),
        title: z.string(),
        description: z.string(),
        systemPrompt: z.string(),
        isShared: z.boolean().default(false).optional(),
        systemPromptTokenCount: z.number(),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      const payload = CreateAssistantDto.fromInput(input);

      // policy check
      services.assistantService.canCreateAssistantPolicy(payload, user);

      return await services.assistantService.create(payload);
    }),
  // get assistant by id
  one: protectedProcedure.input(idSchema).query(async ({ ctx: { user, services }, input }) => {
    const payload = FindAssistantDto.fromInput(input);
    const assistant = await services.assistantService.findFirst(payload);

    if (!assistant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Assistant not found',
      });
    }

    // console.log(assistant);

    // policy check
    services.assistantService.canAccessAssistantPolicy(assistant, user);

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
    .query(({ ctx: { user, services }, input }) => {
      const payload = FindAllAssistantsDto.fromInput(user.teamId, input.page, input.searchQuery);

      return services.assistantService.findAll(payload);
    }),
  // update assistant by id
  update: protectedProcedure
    .input(
      z.object({
        teamId: cuidRule(),
        llmId: cuidRule(),
        id: cuidRule(),
        title: z.string(),
        description: z.string(),
        systemPrompt: z.string(),
        isShared: z.boolean().optional(),
        systemPromptTokenCount: z.number(),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      const payload = UpdateAssistantDto.fromInput(input);

      // policy check
      await services.assistantService.canUpdateAssistantPolicy(payload, user);

      return await services.assistantService.update(payload);
    }),
  // delete assistant by id
  delete: protectedProcedure
    .input(
      z.object({
        teamId: cuidRule(),
        id: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      const deletePayload = DeleteAssistantDto.fromInput(input);

      // policy check
      await services.assistantService.canDeleteAssistantPolicy(deletePayload, user);

      return await services.assistantService.softDelete(deletePayload);
    }),
});
