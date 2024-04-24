import { AssistantService } from '~/server/services/assistant.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const assistantRouter = router({
  details: protectedProcedure
    .input(
      z.object({
        id: z.string().toUpperCase().ulid(),
      }),
    )
    .query(({ ctx, input }) => {
      const assistantService = new AssistantService(ctx.prisma);
      return assistantService.getDetails({
        userId: ctx.user.id,
        assistantId: input.id.toLowerCase(),
      });
    }),
});
