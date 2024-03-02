import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ULID } from '~/server/utils/ulid';

export const assistantRouter = router({
  // create assistant
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        systemPrompt: z.string(),
        isShared: z.boolean().optional(),
        systemPromptTokenCount: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const userId = ctx.user?.id;
      return ctx.prisma.assistant.create({
        data: {
          id: ULID(),
          userId,
          title: input.title,
          description: input.description,
          systemPrompt: input.systemPrompt,
          isShared: input.isShared,
          systemPromptTokenCount: input.systemPromptTokenCount,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
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
      const userId = ctx.user?.id;
      return ctx.prisma.assistant.findFirst({
        where: {
          userId,
          id: input.id.toLowerCase(),
        },
        include: {
          user: true,
        },
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
      const userId = ctx.user?.id;
      const { page } = input;
      return ctx.prisma.assistant
        .paginate({
          where: {
            userId,
          },
          select: {
            id: true,
            title: true,
            description: true,
            isShared: true,
          },
        })
        .withPages({
          limit: 10,
          page,
          includePageCount: true,
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
      const userId = ctx.user?.id;
      return ctx.prisma.assistant.update({
        where: {
          userId,
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          systemPrompt: input.systemPrompt,
          isShared: input.isShared,
          systemPromptTokenCount: input.systemPromptTokenCount,
          updatedAt: new Date(),
        },
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
      const userId = ctx.user?.id;
      return ctx.prisma.assistant.delete({
        where: {
          userId,
          id: input.id,
        },
      });
    }),
});
