import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { cuidRule } from '~/server/utils/validation/ulid.rule';

export const workflowExecRouter = router({
  execute: protectedProcedure
    .input(
      z.object({
        workflowId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      return await services.workflowExecService.executeWorkflow(user.id, input.workflowId.toLowerCase());
    }),
});
