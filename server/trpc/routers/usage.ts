import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { UsageService } from '~/server/services/usage.service';

const prisma = getPrismaClient();
const usageService = new UsageService(prisma);

export const usageRouter = router({
  // get token usage
  tokenUsage: protectedProcedure.query(async ({ ctx, input }) => {
    const usage = await usageService.getTokenUsage(ctx.user.id);

    if (!usage) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usage not found',
      });
    }

    return usage;
  }),
});
