import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import {
  CreateAssistantDto,
  DeleteAssistantDto,
  FindAllAssistantsDto,
  FindAssistantDto,
  UpdateAssistantDto,
} from '~/server/services/dto/assistant.dto';
import { idSchema, cuidRule } from '~/server/utils/validation/ulid.rule';
import { AssistantNotFoundError } from '../errors/assistantNotFoundError';
import { ForbiddenError } from '../errors/forbiddenError';

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
        tools: z.array(z.string().cuid2()),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      // policy check
      const allowed = services.assistantService.canCreateAssistantPolicy(user, input.teamId);

      if (!allowed) {
        throw new ForbiddenError();
      }

      return await services.assistantService.create(CreateAssistantDto.fromInput(input));
    }),
  // get assistant by id
  one: protectedProcedure.input(idSchema).query(async ({ ctx: { user, services }, input }) => {
    const payload = FindAssistantDto.fromInput(input);
    const assistant = await services.assistantService.findFirst(payload);

    if (!assistant) {
      throw new AssistantNotFoundError();
    }

    // policy check
    const allowed = services.assistantService.canAccessAssistantPolicy(user, assistant);

    if (!allowed) {
      throw new ForbiddenError();
    }

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
    .query(async ({ ctx: { user, services }, input }) => {
      const payload = FindAllAssistantsDto.fromInput(user.teamId, input.page, input.searchQuery);

      return await services.assistantService.findAll(payload);
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
        tools: z.array(z.string().cuid2()),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      const payloadF = FindAssistantDto.fromInput(input);
      const assistant = await services.assistantService.findFirst(payloadF);

      if (!assistant) {
        throw new AssistantNotFoundError();
      }

      // policy check
      const allowed = services.assistantService.canUpdateAssistantPolicy(user, assistant);

      if (!allowed) {
        throw new ForbiddenError();
      }

      return await services.assistantService.update(
        UpdateAssistantDto.fromInput({
          id: input.id,
          teamId: input.teamId,
          llmId: input.llmId,
          title: input.title,
          description: input.description,
          systemPrompt: input.systemPrompt,
          isShared: input.isShared,
          systemPromptTokenCount: input.systemPromptTokenCount,
          tools: input.tools,
        }),
      );
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
      const payloadF = FindAssistantDto.fromInput(input);
      const assistant = await services.assistantService.findFirst(payloadF);

      if (!assistant) {
        throw new AssistantNotFoundError();
      }

      // policy check
      const allowed = services.assistantService.canDeleteAssistantPolicy(user, assistant);

      if (!allowed) {
        throw new ForbiddenError();
      }

      return await services.assistantService.softDelete(DeleteAssistantDto.fromInput(input));
    }),
});
