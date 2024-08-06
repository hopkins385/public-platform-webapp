import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { cuidRule } from '~/server/utils/validation/ulid.rule';
import { WorkflowStepService } from '~/server/services/workflow-step.service';
import {
  CreateWorkflowStepDto,
  UpdateWorkflowStepAssistantDto,
  UpdateWorkflowStepDto,
  UpdateWorkflowStepNameDto,
} from '~/server/services/dto/workflow-step.dto';
import prisma from '~/server/prisma';

const workflowStepService = new WorkflowStepService(prisma);

export const workflowStepRouter = router({
  // create workflow step
  create: protectedProcedure
    .input(
      z.object({
        workflowId: cuidRule(),
        projectId: cuidRule(),
        assistantId: cuidRule(),
        name: z.string(),
        description: z.string(),
        orderColumn: z.number(),
        rowCount: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = CreateWorkflowStepDto.fromInput(input);
      return workflowStepService.create(payload);
    }),
  // find workflow step
  first: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
      }),
    )
    .query(async ({ input }) => {
      return workflowStepService.findFirst(input.workflowStepId);
    }),
  // find workflow step including stepables
  firstWithSteps: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
      }),
    )
    .query(async ({ input }) => {
      return workflowStepService.findFirst(input.workflowStepId);
    }),
  // update workflow step
  update: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
        name: z.string(),
        description: z.string(),
        orderColumn: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = UpdateWorkflowStepDto.fromInput(input);
      return workflowStepService.update(payload);
    }),
  // update the workflow name
  updateName: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
        name: z.string().max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = UpdateWorkflowStepNameDto.fromInput(input);
      return workflowStepService.updateName(payload);
    }),

  // update the assistant
  updateAssistant: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
        assistantId: cuidRule(),
      }),
    )
    .mutation(async ({ input }) => {
      const updatePayload = UpdateWorkflowStepAssistantDto.fromInput(input);
      return workflowStepService.updateAssistant(updatePayload);
    }),

  // update the Input steps
  updateInputSteps: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
        inputStepIds: z.array(cuidRule()),
      }),
    )
    .mutation(async ({ input }) => {
      return workflowStepService.updateInputSteps(input.workflowStepId, input.inputStepIds);
    }),

  // delete the workflow step
  delete: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
      }),
    )
    .mutation(async ({ input }) => {
      return workflowStepService.softDelete(input.workflowStepId);
    }),
});
