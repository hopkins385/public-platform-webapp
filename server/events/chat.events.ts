import { services } from './../service-instances';
import type { FirstUserMessageEventDto, StreamFinishedEventDto } from '~/server/services/dto/event.dto';
import type { ChatToolCallEventDto } from './dto/chatToolCallEvent.dto';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import socket, { SocketEvent } from '~/server/socket';
import consola from 'consola';
import { Queue } from '../utils/enums/queue.enum';

const { queueAddJob } = useBullmq();

const logger = consola.create({}).withTag('chat-events');

export async function chatStreamFinishedEvent(data: StreamFinishedEventDto) {
  const { chatId, userId, messageContent } = data;

  if (!messageContent || messageContent.trim() === '') {
    logger.error('Stream finished but message content empty');
    return;
  }

  await services.chatService.createMessageAndReduceCredit(
    CreateChatMessageDto.fromInput({
      userId,
      chatId,
      message: { type: 'text', role: 'assistant', content: messageContent },
    }),
  );

  socket.emitEvent({ room: `user:${userId}`, event: SocketEvent.CREDITS, data: { credits: 1 } });
}

export async function firstUserMessageEvent(data: FirstUserMessageEventDto) {
  const options = {
    delay: 1000,
  };
  const job = await queueAddJob(Queue.CREATE_CHAT_TITLE, 'createChatTitleJob', data, options);
}

export function chatToolCallStartEvent(data: ChatToolCallEventDto) {
  const { userId, chatId, toolName, toolInfo } = data;
  socket.emitEvent({ room: `user:${userId}`, event: `chat-${chatId}-tool-start-event`, data: { toolName, toolInfo } });
}

export function chatToolCallEndEvent(data: ChatToolCallEventDto) {
  const { userId, chatId, toolName } = data;
  socket.emitEvent({ room: `user:${userId}`, event: `chat-${chatId}-tool-end-event`, data: toolName });
}
