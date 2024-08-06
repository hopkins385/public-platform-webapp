import { CreateWorkflowDto, FindAllWorkflowsDto, UpdateWorkflowDto } from '~/server/services/dto/workflow.dto';
import { WorkflowService } from '~/server/services/workflow.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ulidRule } from '~/server/utils/validation/ulid.rule';
import { TRPCError } from '@trpc/server';
import prisma from '~/server/prisma';

const workflowService = new WorkflowService(prisma);

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
      const pass = await workflowService.canCreateWorkflowPolicy(payload, ctx.user);
      return await workflowService.create(payload);
    }),

  // re-create workflow from media
  reCreateFromMedia: protectedProcedure
    .input(
      z.object({
        workflowId: ulidRule(),
        mediaId: ulidRule(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // const pass = await workflowService.canReCreateFromMediaPolicy(input.workflowId, ctx.user);
      return await workflowService.reCreateFromMedia(input);
    }),

  // find workflow including steps
  full: protectedProcedure
    .input(
      z.object({
        workflowId: ulidRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workflow = await workflowService.findFirstWithSteps(input.workflowId);

      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      // policy check
      workflowService.canAccessWorkflowPolicy(workflow.project.team.id, ctx.user);

      return workflow;
    }),

  // find workflow settings
  settings: protectedProcedure
    .input(
      z.object({
        workflowId: ulidRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workflow = await workflowService.findFirst(input.workflowId);

      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      // policy check
      workflowService.canAccessWorkflowPolicy(workflow.project.team.id, ctx.user);

      return workflow;
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

      const workflow = await workflowService.findAll(payload);

      // TODO: policy check
      // const pass = workflowService.canAccessWorkflowPolicy(
      //   workflow.project.team.id,
      //   ctx.user,
      // );
      return workflow;
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

      const pass = await workflowService.canUpdateWorkflowPolicy(payload, ctx.user);

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
      const pass = await workflowService.canDeleteWorkflowPolicy(input.workflowId, ctx.user);

      return await workflowService.delete(input.workflowId);
    }),

  deleteRows: protectedProcedure
    .input(
      z.object({
        workflowId: ulidRule(),
        orderColumns: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // const pass = await workflowService.canDeleteRowsPolicy(input.workflowId, ctx.user);

      return await workflowService.deleteRows({
        workflowId: input.workflowId,
        orderColumns: input.orderColumns,
      });
    }),
});
