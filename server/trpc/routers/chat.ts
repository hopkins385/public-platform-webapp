import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { cuidRule } from '~/server/utils/validation/ulid.rule';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import { ChatMessageRule } from '~/server/utils/validation/chat-message.rule';
import { GetAllChatsForUserDto } from '~/server/services/dto/chat.dto';
import { FindAssistantDto } from '~/server/services/dto/assistant.dto';
import { ForbiddenError } from '../errors/forbiddenError';
import { AssistantNotFoundError } from '../errors/assistantNotFoundError';
import { ChatNotFoundError } from '../errors/chatNotFoundError';

export const chatRouter = router({
  // create a chat
  create: protectedProcedure
    .input(
      z.object({
        assistantId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      const payload = FindAssistantDto.fromInput({ id: input.assistantId });
      const assistant = await services.assistantService.findFirst(payload);

      if (!assistant) {
        throw new AssistantNotFoundError();
      }

      // policy check
      const allowed = services.chatService.canCreateChatPolicy(user, assistant);

      if (!allowed) {
        throw new ForbiddenError();
      }

      return await services.chatService.create(input.assistantId, user.id);
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
      throw new Error('Not implemented');
      const payload = CreateChatMessageDto.fromInput({
        userId: user.id,
        chatId: input.chatId,
        message: input.message,
      });
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
      // find chat
      const chat = await services.chatService.getFirst(input.chatId);
      if (!chat) {
        throw new ChatNotFoundError();
      }

      // policy check
      const allowed = services.chatService.canClearMessagesPolicy(user, chat);

      if (!allowed) {
        throw new ForbiddenError();
      }

      return await services.chatService.clearMessages(input.chatId);
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
      // find chat
      const chat = await services.chatService.getFirst(input.chatId);

      if (!chat) {
        throw new ChatNotFoundError();
      }

      // policy check
      const allowed = services.chatService.canDeletePolicy(user, chat);

      if (!allowed) {
        throw new ForbiddenError();
      }

      return await services.chatService.softDelete(user.id, input.chatId);
    }),
});
