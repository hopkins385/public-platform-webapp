import { creditService } from '../service-instances';
import socket, { SocketEvent } from '~/server/socket';

export interface IUpdateCreditsEvent {
  userId: string;
  credits: number;
}

export async function updateCreditsEvent(data: IUpdateCreditsEvent) {
  const { userId, credits } = data;

  await creditService.reduceCredit(userId, credits);

  socket.emitEvent({
    room: `user:${userId}`,
    event: SocketEvent.CREDITS,
    data: {
      credits,
    },
  });
}
