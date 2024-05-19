import { ChatService } from '~/server/services/chat.service';
import { CreditService } from '~/server/services/credit.service';
import { CreateChatMessageDto } from '~/server/services/dto/chat-message.dto';

export async function chatStreamFinished(data: any) {
  const chatService = new ChatService();
  const creditService = new CreditService();

  const { chatId, userId, messageContent } = data;

  const payload = CreateChatMessageDto.fromInput({
    userId,
    chatId,
    message: { type: 'text', role: 'assistant', content: messageContent },
  });

  await chatService.createMessage(payload);

  await creditService.reduceCredit(userId, 1);
}
