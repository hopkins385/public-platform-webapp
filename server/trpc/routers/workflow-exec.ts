import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ulidRule } from '~/server/utils/validation/ulid.rule';
import { WorkflowExecutionService } from '~/server/services/workflow-execution.service';
import prisma from '~/server/prisma';

const workflowExecService = new WorkflowExecutionService(prisma);

export const workflowExecRouter = router({
  execute: protectedProcedure
    .input(
      z.object({
        workflowId: ulidRule(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return workflowExecService.executeWorkflow(ctx.user.id, input.workflowId.toLowerCase());
    }),
});
