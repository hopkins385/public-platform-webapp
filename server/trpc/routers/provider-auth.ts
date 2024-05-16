import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ProviderAuthService } from '~/server/services/provider-auth.service';

const providerAuthService = new ProviderAuthService();

export const providerAuthRouter = router({
  get: protectedProcedure
    .input(
      z.object({
        providerName: z.enum(['google', 'microsoft']),
        type: z.enum(['googledrive', 'onedrive']),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await providerAuthService.findFirst({
        userId: ctx.user.id,
        providerName: input.providerName,
        type: input.type,
      });
    }),
});
