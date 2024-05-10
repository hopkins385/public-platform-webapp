import { CreditService } from './../services/credit.service';
import { ChatService } from './../services/chat.service';
import { LastLoginDto } from '../services/dto/last-login.dto';
import { UserService } from '../services/user.service';
import { ChatEvent } from '../utils/enums/chat-event.enum';
import { eventEmitter } from '../utils/events';
import { consola } from 'consola';
import { AuthEvent } from '../utils/enums/auth-event.enum';

const logger = consola.create({}).withTag('event');

async function chatStreamFinished(data: any) {
  const chatService = new ChatService();
  const creditService = new CreditService();

  const { chatId, userId, messageContent } = data;

  await chatService.createMessage({
    chatId,
    chatMessage: { role: 'assistant', content: messageContent },
  });

  await creditService.reduceCredit(userId, 1);
}

async function updateLastLogin(user: any) {
  const userService = new UserService();
  const payload = LastLoginDto.fromInput({
    email: user.email,
    lastLoginAt: new Date(),
  });
  await userService.updateLastLogin(payload);
}

export default defineNitroPlugin((nitroApp) => {
  // Listen to events

  eventEmitter.on(AuthEvent.LOGIN, updateLastLogin);

  eventEmitter.on(ChatEvent.STREAMFINISHED, chatStreamFinished);

  eventEmitter.on('RowCompleted', async (data) => {
    const { getSocketServer } = useSocketServer();
    const io = getSocketServer();
    const { workflowId } = data;
    io.to(`room_${workflowId}`).emit('new_message', data);
    logger.info('RowCompleted', data);
  });
});
