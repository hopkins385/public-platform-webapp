import { TRPCError } from '@trpc/server';

export class ChatNotFoundError extends TRPCError {
  constructor() {
    super({
      code: 'NOT_FOUND',
      message: 'Chat not found',
    });
  }
}
