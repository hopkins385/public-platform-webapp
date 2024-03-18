import { AssistantService } from '~/server/services/assistant.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const assistantRouter = router({
  // create assistant
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        systemPrompt: z.string(),
        isShared: z.boolean().default(false).optional(),
        systemPromptTokenCount: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const assistantService = new AssistantService(ctx.prisma);
      return assistantService.create({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        systemPrompt: input.systemPrompt,
        isShared: input.isShared,
        systemPromptTokenCount: input.systemPromptTokenCount,
      });
    }),
  // get assistant by id
  one: protectedProcedure
    .input(
      z.object({
        id: z.string().toUpperCase().ulid(),
      }),
    )
    .query(({ ctx, input }) => {
      const assistantService = new AssistantService(ctx.prisma);
      return assistantService.findFirst({
        userId: ctx.user.id,
        assistantId: input.id,
      });
    }),
  // get all assistants
  all: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
      }),
    )
    .query(({ ctx, input }) => {
      const assistantService = new AssistantService(ctx.prisma);
      return assistantService.findAll({
        userId: ctx.user.id,
        page: input.page,
      });
    }),
  // update assistant by id
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        systemPrompt: z.string(),
        isShared: z.boolean().optional(),
        systemPromptTokenCount: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const assistantService = new AssistantService(ctx.prisma);
      return assistantService.update({
        userId: ctx.user.id,
        assistantId: input.id,
        title: input.title,
        description: input.description,
        systemPrompt: input.systemPrompt,
        isShared: input.isShared,
        systemPromptTokenCount: input.systemPromptTokenCount,
      });
    }),
  // delete assistant by id
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const assistantService = new AssistantService(ctx.prisma);
      return assistantService.softDelete({
        userId: ctx.user.id,
        assistantId: input.id,
      });
    }),
});
