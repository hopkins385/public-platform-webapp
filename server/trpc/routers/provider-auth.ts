import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const providerAuthRouter = router({
  get: protectedProcedure
    .input(
      z.object({
        providerName: z.enum(['google', 'microsoft']),
        type: z.enum(['googledrive', 'onedrive']),
      }),
    )
    .query(async ({ input, ctx: { user, services } }) => {
      return await services.providerAuthService.findFirst({
        userId: user.id,
        providerName: input.providerName,
        type: input.type,
      });
    }),
});
