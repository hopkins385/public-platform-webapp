import type { FirstUserMessageEventDto, StreamFinishedEventDto } from '~/server/services/dto/event.dto';
import type { ChatToolCallEventDto } from './dto/chatToolCallEvent.dto';
import { ChatService } from '~/server/services/chat.service';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import { getIO } from '../socket/socketInstance';
import consola from 'consola';
import prisma from '../prisma';

const chatService = new ChatService(prisma);
const { queueAddJob } = useBullmq();

const logger = consola.create({}).withTag('chat-events');

export async function chatStreamFinishedEvent(data: StreamFinishedEventDto) {
  const { chatId, userId, messageContent } = data;

  if (!messageContent || messageContent.trim() === '') {
    logger.error('Stream finished but message content empty');
    return;
  }

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
  const { userId, chatId, toolName, toolInfo } = data;

  io.to(`user:${userId}`).emit(`chat-${chatId}-tool-start-event`, { toolName, toolInfo });
}

export function chatToolCallEndEvent(data: ChatToolCallEventDto) {
  const io = getIO();
  const { userId, chatId, toolName } = data;

  io.to(`user:${userId}`).emit(`chat-${chatId}-tool-end-event`, toolName);
}
