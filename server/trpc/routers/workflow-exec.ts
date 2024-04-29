import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ulidRule } from '~/server/utils/validation/ulid.rule';
import { WorkflowExecutionService } from '~/server/services/workflow-execution.service';

export const workflowExecRouter = router({
  execute: protectedProcedure
    .input(
      z.object({
        workflowId: ulidRule(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workflowExecService = new WorkflowExecutionService(ctx.prisma);
      return workflowExecService.executeWorkflow(
        input.workflowId.toLowerCase(),
      );
    }),
});
