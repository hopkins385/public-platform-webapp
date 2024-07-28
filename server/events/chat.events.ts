import type { FirstUserMessageEventDto, StreamFinishedEventDto } from '~/server/services/dto/event.dto';
import type { ChatToolCallEventDto } from './dto/chatToolCallEvent.dto';
import { ChatService } from '~/server/services/chat.service';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import { getIO } from '../socket/socketInstance';

const prisma = getPrismaClient();
const chatService = new ChatService(prisma);
const { queueAddJob } = useBullmq();

export async function chatStreamFinishedEvent(data: StreamFinishedEventDto) {
  const { chatId, userId, messageContent } = data;

  await chatService.createMessageAndReduceCredit(
    CreateChatMessageDto.fromInput({
      userId,
      chatId,
      message: { type: 'text', role: 'assistant', content: messageContent },
    }),
  );
}

export async function firstUserMessageEvent(data: FirstUserMessageEventDto) {
  const options = {
    delay: 1000,
  };
  const job = await queueAddJob(QueueEnum.CREATE_CHAT_TITLE, 'createChatTitleJob', data, options);
}

export function chatToolCallStartEvent(data: ChatToolCallEventDto) {
  const io = getIO();
  const { userId, chatId, toolName } = data;

  io.to(`user:${userId}`).emit(`chat-${chatId}-tool-start-event`, toolName);
}

export function chatToolCallEndEvent(data: ChatToolCallEventDto) {
  const io = getIO();
  const { userId, chatId, toolName } = data;

  io.to(`user:${userId}`).emit(`chat-${chatId}-tool-end-event`, toolName);
}
