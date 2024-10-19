import { TRPCError } from '@trpc/server';

export class ForbiddenError extends TRPCError {
  constructor() {
    super({
      code: 'FORBIDDEN',
      message: 'Forbidden',
    });
  }
}
