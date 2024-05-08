import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const recordRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        mediaId: z.string(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return 'record created';
    }),
});
