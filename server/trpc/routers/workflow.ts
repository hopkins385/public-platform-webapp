import {
  CreateWorkflowDto,
  FindAllWorkflowsDto,
  UpdateWorkflowDto,
} from './../../services/dto/workflow.dto';
import { WorkflowService } from './../../services/workflow.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ulidRule } from '~/server/utils/validation/ulid.rule';

const workflowService = new WorkflowService();

export const workflowRouter = router({
  // create workflow
  create: protectedProcedure
    .input(
      z.object({
        projectId: ulidRule(),
        assistantId: ulidRule(),
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const payload = CreateWorkflowDto.fromInput(input);
      return workflowService.create(payload);
    }),
  // find workflow including steps
  full: protectedProcedure
    .input(
      z.object({
        workflowId: ulidRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return workflowService.findFirstWithSteps(input.workflowId);
    }),
  // find workflow settings
  settings: protectedProcedure
    .input(
      z.object({
        workflowId: ulidRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return workflowService.findFirst(input.workflowId);
    }),
  // find all workflows for a project
  allForProject: protectedProcedure
    .input(
      z.object({
        projectId: ulidRule(),
        page: z.number().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const payload = FindAllWorkflowsDto.fromInput(input);
      return workflowService.findAll(payload);
    }),

  allForUser: protectedProcedure
    .input(
      z.object({
        projectId: ulidRule().optional(),
        page: z.number().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        user: { id },
      } = ctx;
      return workflowService.findAllForUser(id, input?.projectId, input.page);
    }),

  // update workflow
  update: protectedProcedure
    .input(
      z.object({
        workflowId: ulidRule(),
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const payload = UpdateWorkflowDto.fromInput(input);
      return workflowService.update(payload);
    }),
  // delete workflow
  delete: protectedProcedure
    .input(
      z.object({
        workflowId: ulidRule(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return workflowService.delete(input.workflowId);
    }),
});
