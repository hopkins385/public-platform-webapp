import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ChatService } from './../../services/chat.service';

export const chatRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        assistantId: z.string().toUpperCase().ulid(),
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
        chatId: z.string().toUpperCase().ulid(),
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
  // get one chat
  getAll: protectedProcedure
    .input(
      z.object({
        id: z.string().toUpperCase().ulid(),
      }),
    )
    .query(({ ctx, input }) => {
      const chatService = new ChatService(ctx.prisma);
      return chatService.getAllForUser(ctx.user?.id);
    }),
  clearMessages: protectedProcedure
    .input(
      z.object({
        chatId: z.string().toUpperCase().ulid(),
      }),
    )
    .query(({ ctx, input }) => {
      const chatService = new ChatService(ctx.prisma);
      return chatService.clearMessages(input.chatId.toLowerCase());
    }),
});
