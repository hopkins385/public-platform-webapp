import { creditService } from '../service-instances';
import socket from '../socket';

export interface IUpdateCreditsEvent {
  userId: string;
  credits: number;
}

export async function updateCreditsEvent(data: IUpdateCreditsEvent) {
  const { userId, credits } = data;

  await creditService.reduceCredit(userId, credits);

  const room = `user:${userId}`;
  socket.io.to(room).emit('usage', {});
}
