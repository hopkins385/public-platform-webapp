import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { cuidRule } from '~/server/utils/validation/ulid.rule';
import { WorkflowExecutionService } from '~/server/services/workflow-execution.service';
import prisma from '~/server/prisma';

const workflowExecService = new WorkflowExecutionService(prisma);

export const workflowExecRouter = router({
  execute: protectedProcedure
    .input(
      z.object({
        workflowId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { user }, input }) => {
      return workflowExecService.executeWorkflow(user.id, input.workflowId.toLowerCase());
    }),
});
