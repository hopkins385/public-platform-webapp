import { ChatService } from '~/server/services/chat.service';
import { CreditService } from '~/server/services/credit.service';

export async function chatStreamFinished(data: any) {
  const chatService = new ChatService();
  const creditService = new CreditService();

  const { chatId, userId, messageContent } = data;

  await chatService.createMessage({
    chatId,
    chatMessage: { role: 'assistant', content: messageContent },
  });

  await creditService.reduceCredit(userId, 1);
}
