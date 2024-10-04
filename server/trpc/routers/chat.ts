import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { cuidRule } from '~/server/utils/validation/ulid.rule';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import { ChatMessageRule } from '~/server/utils/validation/chat-message.rule';
import { GetAllChatsForUserDto } from '~/server/services/dto/chat.dto';

export const chatRouter = router({
  // create a chat
  create: protectedProcedure
    .input(
      z.object({
        assistantId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      const userId = user.id;
      const teamId = user.teamId;
      const assistantId = input.assistantId.toLowerCase();

      // policy check
      await services.chatService.canCreateChatPolicy(assistantId, teamId, userId);

      return await services.chatService.create(assistantId, userId);
    }),

  // create a message
  createMessage: protectedProcedure
    .input(
      z.object({
        chatId: cuidRule(),
        message: ChatMessageRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      const payload = CreateChatMessageDto.fromInput({
        userId: user.id,
        chatId: input.chatId,
        message: input.message,
      });

      // policy check
      await services.chatService.canCreateMessagePolicy(payload);

      return await services.chatService.createMessage(payload);
    }),

  allForUser: protectedProcedure.query(async ({ ctx: { user, services } }) => {
    return await services.chatService.getAllForUser(user.id);
  }),

  recentForUser: protectedProcedure.query(async ({ ctx: { user, services } }) => {
    return await services.chatService.getRecentForUser(user.id);
  }),

  allForUserPaginate: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        searchQuery: z.string().max(255).optional(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      const payload = GetAllChatsForUserDto.fromInput({
        userId: user.id,
        page: input.page,
        searchQuery: input.searchQuery,
      });
      return await services.chatService.getAllForUserPaginate(payload);
    }),

  clearMessages: protectedProcedure
    .input(
      z.object({
        chatId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      // policy check
      await services.chatService.canClearMessagesPolicy(input.chatId, user.id);
      return await services.chatService.clearMessages(input.chatId.toLowerCase());
    }),

  forUser: protectedProcedure
    .input(
      z.object({
        chatId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      return await services.chatService.getChatForUser(input.chatId.toLowerCase(), user.id);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        chatId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      // policy check
      await services.chatService.canDeletePolicy(input.chatId, user.id);
      return await services.chatService.softDelete(user.id, input.chatId.toLowerCase());
    }),
});
