import type { FirstUserMessageEventDto, StreamFinishedEventDto } from '~/server/services/dto/event.dto';
import type { ChatToolCallEventDto } from './dto/chatToolCallEvent.dto';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import socket from '../socket';
import consola from 'consola';
import { chatService, creditService } from '../service-instances';

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
  const { userId, chatId, toolName, toolInfo } = data;

  socket.io.to(`user:${userId}`).emit(`chat-${chatId}-tool-start-event`, { toolName, toolInfo });
}

export function chatToolCallEndEvent(data: ChatToolCallEventDto) {
  const { userId, chatId, toolName } = data;

  socket.io.to(`user:${userId}`).emit(`chat-${chatId}-tool-end-event`, toolName);
}
