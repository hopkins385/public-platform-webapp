import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ChatService } from '~/server/services/chat.service';
import { ulidRule } from '~/server/utils/validation/ulid.rule';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import { ChatMessageRule } from '~/server/utils/validation/chat-message.rule';
import { GetAllChatsForUserDto } from '~/server/services/dto/chat.dto';
import prisma from '~/server/prisma';

const chatService = new ChatService(prisma);

export const chatRouter = router({
  // create a chat
  create: protectedProcedure
    .input(
      z.object({
        assistantId: ulidRule(),
      }),
    )
    .query(async ({ ctx: { user }, input }) => {
      const userId = user.id;
      const teamId = user.teamId;
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
    .query(async ({ ctx: { user }, input }) => {
      const payload = CreateChatMessageDto.fromInput({
        userId: user.id,
        chatId: input.chatId,
        message: input.message,
      });

      // policy check
      await chatService.canCreateMessagePolicy(payload);

      return await chatService.createMessage(payload);
    }),

  allForUser: protectedProcedure.query(async ({ ctx: { user } }) => {
    return await chatService.getAllForUser(user.id);
  }),

  recentForUser: protectedProcedure.query(async ({ ctx: { user } }) => {
    return await chatService.getRecentForUser(user.id);
  }),

  allForUserPaginate: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        searchQuery: z.string().max(255).optional(),
      }),
    )
    .query(async ({ ctx: { user }, input }) => {
      const payload = GetAllChatsForUserDto.fromInput({
        userId: user.id,
        page: input.page,
        searchQuery: input.searchQuery,
      });
      return await chatService.getAllForUserPaginate(payload);
    }),

  clearMessages: protectedProcedure
    .input(
      z.object({
        chatId: ulidRule(),
      }),
    )
    .query(async ({ ctx: { user }, input }) => {
      // policy check
      await chatService.canClearMessagesPolicy(input.chatId, user.id);
      return await chatService.clearMessages(input.chatId.toLowerCase());
    }),

  forUser: protectedProcedure
    .input(
      z.object({
        chatId: ulidRule(),
      }),
    )
    .query(async ({ ctx: { user }, input }) => {
      return await chatService.getChatForUser(input.chatId.toLowerCase(), user.id);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        chatId: ulidRule(),
      }),
    )
    .query(async ({ ctx: { user }, input }) => {
      // policy check
      await chatService.canDeletePolicy(input.chatId, user.id);
      return await chatService.softDelete(user.id, input.chatId.toLowerCase());
    }),
});
