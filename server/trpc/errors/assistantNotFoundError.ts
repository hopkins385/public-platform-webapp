import { TRPCError } from '@trpc/server';

export class AssistantNotFoundError extends TRPCError {
  constructor() {
    super({
      code: 'NOT_FOUND',
      message: 'Assistant not found',
    });
  }
}
