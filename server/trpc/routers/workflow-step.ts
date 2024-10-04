import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { cuidRule } from '~/server/utils/validation/ulid.rule';
import {
  CreateWorkflowStepDto,
  UpdateWorkflowStepAssistantDto,
  UpdateWorkflowStepDto,
  UpdateWorkflowStepNameDto,
} from '~/server/services/dto/workflow-step.dto';

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
    .mutation(async ({ ctx: { services }, input }) => {
      const payload = CreateWorkflowStepDto.fromInput(input);
      return await services.workflowStepService.create(payload);
    }),
  // find workflow step
  first: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { services }, input }) => {
      return await services.workflowStepService.findFirst(input.workflowStepId);
    }),
  // find workflow step including stepables
  firstWithSteps: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { services }, input }) => {
      return await services.workflowStepService.findFirst(input.workflowStepId);
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
    .mutation(async ({ ctx: { services }, input }) => {
      const payload = UpdateWorkflowStepDto.fromInput(input);
      return await services.workflowStepService.update(payload);
    }),
  // update the workflow name
  updateName: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
        name: z.string().max(100),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      const payload = UpdateWorkflowStepNameDto.fromInput(input);
      return await services.workflowStepService.updateName(payload);
    }),

  // update the assistant
  updateAssistant: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
        assistantId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      const updatePayload = UpdateWorkflowStepAssistantDto.fromInput(input);
      return await services.workflowStepService.updateAssistant(updatePayload);
    }),

  // update the Input steps
  updateInputSteps: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
        inputStepIds: z.array(cuidRule()),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      return await services.workflowStepService.updateInputSteps(input.workflowStepId, input.inputStepIds);
    }),

  // delete the workflow step
  delete: protectedProcedure
    .input(
      z.object({
        workflowStepId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      return await services.workflowStepService.softDelete(input.workflowStepId);
    }),
});
