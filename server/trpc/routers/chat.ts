import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ChatService } from '~/server/services/chat.service';
import { ulidRule } from '~/server/utils/validation/ulid.rule';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import { ChatMessageRule } from '~/server/utils/validation/chat-message.rule';

const prisma = getPrismaClient();
const chatService = new ChatService(prisma);

export const chatRouter = router({
  // create a chat
  create: protectedProcedure
    .input(
      z.object({
        assistantId: ulidRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const teamId = ctx.user.teamId;
      const assistantId = input.assistantId.toLowerCase();

      // policy check
      await chatService.canCreateChatPolicy(assistantId, teamId, userId);

      return await chatService.create(assistantId, userId);
    }),

  // create a message
  createMessage: protectedProcedure
    .input(
      z.object({
        chatId: ulidRule(),
        message: ChatMessageRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const payload = CreateChatMessageDto.fromInput({
        userId: ctx.user.id,
        chatId: input.chatId,
        message: input.message,
      });

      // policy check
      await chatService.canCreateMessagePolicy(payload);

      return await chatService.createMessage(payload);
    }),

  allForUser: protectedProcedure.query(async ({ ctx }) => {
    return await chatService.getAllForUser(ctx.user.id);
  }),

  recentForUser: protectedProcedure.query(async ({ ctx }) => {
    return await chatService.getRecentForUser(ctx.user.id);
  }),

  allForUserPaginate: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page } = input;
      return await chatService.getAllForUserPaginate(ctx.user.id, page);
    }),

  clearMessages: protectedProcedure
    .input(
      z.object({
        chatId: ulidRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // policy check
      await chatService.canClearMessagesPolicy(input.chatId, ctx.user.id);
      return await chatService.clearMessages(input.chatId.toLowerCase());
    }),

  forUser: protectedProcedure
    .input(
      z.object({
        chatId: ulidRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await chatService.getChatForUser(
        input.chatId.toLowerCase(),
        ctx.user.id,
      );
    }),

  delete: protectedProcedure
    .input(
      z.object({
        chatId: ulidRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // policy check
      await chatService.canDeletePolicy(input.chatId, ctx.user.id);
      return await chatService.softDelete(
        ctx.user.id,
        input.chatId.toLowerCase(),
      );
    }),
});
