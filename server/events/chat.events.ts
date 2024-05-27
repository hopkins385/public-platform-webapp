import { ChatService } from '~/server/services/chat.service';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';
import type { FirstUserMessageEventDto, StreamFinishedEventDto } from '~/server/services/dto/event.dto';

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
