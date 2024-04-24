import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ChatService } from './../../services/chat.service';
import { ulidRule } from '~/server/utils/validation/ulid.rule';

export const chatRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        assistantId: ulidRule(),
      }),
    )
    .query(({ ctx, input }) => {
      const userId = ctx.user?.id;
      const assistantId = input.assistantId.toLowerCase();
      const chatService = new ChatService(ctx.prisma);
      return chatService.create(assistantId, userId);
    }),
  createMessage: protectedProcedure
    .input(
      z.object({
        chatId: ulidRule(),
        chatMessage: z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        }),
      }),
    )
    .query(({ ctx, input }) => {
      const chatService = new ChatService(ctx.prisma);
      return chatService.createMessage({
        chatId: input.chatId.toLocaleLowerCase(),
        chatMessage: input.chatMessage,
      });
    }),
  allForUser: protectedProcedure.query(({ ctx, input }) => {
    const chatService = new ChatService(ctx.prisma);
    return chatService.getAllForUser(ctx.user?.id);
  }),
  allForUserPaginate: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
      }),
    )
    .query(({ ctx, input }) => {
      const { page } = input;
      const chatService = new ChatService(ctx.prisma);
      return chatService.getAllForUserPaginate(ctx.user.id, page);
    }),
  clearMessages: protectedProcedure
    .input(
      z.object({
        chatId: ulidRule(),
      }),
    )
    .query(({ ctx, input }) => {
      const chatService = new ChatService(ctx.prisma);
      return chatService.clearMessages(input.chatId.toLowerCase());
    }),
  forUser: protectedProcedure
    .input(
      z.object({
        chatId: ulidRule(),
      }),
    )
    .query(({ ctx, input }) => {
      const chatService = new ChatService(ctx.prisma);
      return chatService.getChatForUser(
        input.chatId.toLowerCase(),
        ctx.user?.id,
      );
    }),
  delete: protectedProcedure
    .input(
      z.object({
        chatId: ulidRule(),
      }),
    )
    .query(({ ctx, input }) => {
      const chatService = new ChatService(ctx.prisma);
      return chatService.softDelete(ctx.user.id, input.chatId.toLowerCase());
    }),
});
