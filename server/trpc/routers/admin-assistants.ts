import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { TeamService } from '~/server/services/team.service';
import { AssistantService } from '~/server/services/assistant.service';
import type { Assistant, User } from '@prisma/client';
import type { Session } from 'next-auth';

const ulidRule = () => z.string().toUpperCase().ulid();

interface UserAssistantPolicyPayload {
  assistant: Assistant | null | undefined;
  user: Session['user'];
}

interface UserBelongsToTeamPayload {
  teamId: string;
  user: Session['user'];
}

function userAssistantPolicy(payload: UserAssistantPolicyPayload) {
  return false;
  if (!payload.assistant) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Assistant not found',
    });
  }

  // check if the assistant teamId is in the array of teams the user belongs to
  if (!payload.user.teams.includes(payload.assistant.teamId)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this assistant',
    });
  }

  // payload.assistant.isShared

  return true;
}

function userBelongsToTeamPolicy(payload: UserBelongsToTeamPayload) {
  if (payload.user.teamId !== payload.teamId.toLowerCase()) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this team',
    });
  }

  return true;
}

export const adminAssistantRouter = router({
  // create assistant
  create: protectedProcedure
    .input(
      z.object({
        teamId: ulidRule(),
        title: z.string(),
        description: z.string(),
        systemPrompt: z.string(),
        isShared: z.boolean().default(false).optional(),
        systemPromptTokenCount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const assistantService = new AssistantService(ctx.prisma);

      // check if the user belongs to the team
      const pass = userBelongsToTeamPolicy({
        teamId: input.teamId,
        user: ctx.user,
      });

      const result = await assistantService.create({
        teamId: input.teamId,
        title: input.title,
        description: input.description,
        systemPrompt: input.systemPrompt,
        isShared: input.isShared,
        systemPromptTokenCount: input.systemPromptTokenCount,
      });

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
      const assistantService = new AssistantService(ctx.prisma);

      const assistant = await assistantService.findFirst({
        assistantId: input.id,
      });

      const pass = userAssistantPolicy({
        assistant,
        user: ctx.user,
      });

      return assistant;
    }),
  // get all assistants
  all: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const assistantService = new AssistantService(ctx.prisma);

      const assistants = await assistantService.findAll({
        teamId: ctx.user.teamId,
        page: input.page,
      });

      return assistants;
    }),
  // update assistant by id
  update: protectedProcedure
    .input(
      z.object({
        teamId: ulidRule(),
        id: ulidRule(),
        title: z.string(),
        description: z.string(),
        systemPrompt: z.string(),
        isShared: z.boolean().optional(),
        systemPromptTokenCount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const assistantService = new AssistantService(ctx.prisma);

      // first find the assistant
      const assistant = await assistantService.findFirst({
        assistantId: input.id,
      });

      // then check if the user has access to the assistant
      const pass = userAssistantPolicy({
        assistant,
        user: ctx.user,
      });

      const result = await assistantService.update({
        teamId: input.teamId,
        assistantId: input.id,
        title: input.title,
        description: input.description,
        systemPrompt: input.systemPrompt,
        isShared: input.isShared,
        systemPromptTokenCount: input.systemPromptTokenCount,
      });

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
      const assistantService = new AssistantService(ctx.prisma);

      // first find the assistant
      const assistant = await assistantService.findFirst({
        assistantId: input.id,
      });

      // then check if the user has access to the assistant
      const pass = userAssistantPolicy({
        assistant,
        user: ctx.user,
      });

      const result = await assistantService.softDelete({
        teamId: input.teamId,
        assistantId: input.id,
      });

      return result;
    }),
});
