import { TRPCError } from '@trpc/server';

export class CollectionNotFoundError extends TRPCError {
  constructor() {
    super({
      code: 'NOT_FOUND',
      message: 'Collection not found',
    });
  }
}
