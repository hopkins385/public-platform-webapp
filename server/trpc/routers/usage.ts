import { protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';

export const usageRouter = router({
  // get token usage
  tokenUsage: protectedProcedure.query(async ({ ctx: { user, services } }) => {
    const usage = await services.usageService.getTokenUsage(user.id);

    if (!usage) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usage not found',
      });
    }

    return usage;
  }),
});
