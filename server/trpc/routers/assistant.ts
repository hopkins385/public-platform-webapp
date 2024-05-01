import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AssistantService } from '~/server/services/assistant.service';
import type { Assistant } from '@prisma/client';
import type { Session } from 'next-auth';
import {
  CreateAssistantDto,
  DeleteAssistantDto,
  FindAllAssistantsDto,
  FindAssistantDto,
  UpdateAssistantDto,
} from '~/server/services/dto/assistant.dto';
import { ulidRule } from '~/server/utils/validation/ulid.rule';

interface UserAssistantPolicyPayload {
  assistant: Assistant | null | undefined;
  user: Session['user'];
}

interface UserBelongsToTeamPayload {
  teamId: string;
  user: Session['user'];
}

const assistantService = new AssistantService();

function userBelongsToTeamPolicy(payload: UserBelongsToTeamPayload) {
  if (payload.user.teamId !== payload.teamId.toLowerCase()) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this team',
    });
  }

  return true;
}

function userCanAccessAssistantPolicy(payload: UserAssistantPolicyPayload) {
  if (!payload.assistant) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Assistant not found',
    });
  }

  if (payload.assistant.teamId !== payload.user.teamId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this assistant',
    });
  }

  return true;
}

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
      // const pass = userBelongsToTeamPolicy({
      //   teamId: input.teamId,
      //   user: ctx.user,
      // });

      const payload = CreateAssistantDto.fromRequest(input);
      const result = await assistantService.create(payload);

      return result;
    }),
  // get assistant by id
  one: protectedProcedure
    .input(
      z.object({
        id: ulidRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const payload = FindAssistantDto.fromRequest(input);
      const assistant = await assistantService.findFirst(payload);

      // const pass = userCanAccessAssistantPolicy({
      //   assistant,
      //   user: ctx.user,
      // });

      return assistant;
    }),
  // get all assistants
  all: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
      }),
    )
    .query(({ ctx, input }) => {
      const payload = FindAllAssistantsDto.fromRequest(
        ctx.user.teamId,
        input.page,
      );

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
      const payload = FindAssistantDto.fromRequest(input);
      const assistant = await assistantService.findFirst(payload);

      // const pass = userCanAccessAssistantPolicy({
      //   assistant,
      //   user: ctx.user,
      // });

      const updatePayload = UpdateAssistantDto.fromRequest(input);
      const result = await assistantService.update(updatePayload);

      return result;
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
      const payload = FindAssistantDto.fromRequest(input);
      const assistant = await assistantService.findFirst(payload);

      // const pass = userCanAccessAssistantPolicy({
      //   assistant,
      //   user: ctx.user,
      // });

      const deletePayload = DeleteAssistantDto.fromRequest(input);
      const result = await assistantService.softDelete(deletePayload);

      return result;
    }),
});
