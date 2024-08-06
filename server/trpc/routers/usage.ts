import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { UsageService } from '~/server/services/usage.service';
import prisma from '~/server/prisma';

const usageService = new UsageService(prisma);

export const usageRouter = router({
  // get token usage
  tokenUsage: protectedProcedure.query(async ({ ctx: { user } }) => {
    const usage = await usageService.getTokenUsage(user.id);

    if (!usage) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usage not found',
      });
    }

    return usage;
  }),
});
