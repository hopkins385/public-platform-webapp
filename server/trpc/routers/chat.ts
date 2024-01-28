import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const chatRouter = router({
  // get one chat
  one: protectedProcedure
    .input(
      z.object({
        id: z.string().toUpperCase().ulid(),
      }),
    )
    .query(({ ctx, input }) => {
      const userId = ctx.user?.id;
      return ctx.prisma.chat.findFirst({
        where: {
          userId,
          id: input.id.toLowerCase(),
        },
        include: {
          user: true,
        },
      });
    }),
});
