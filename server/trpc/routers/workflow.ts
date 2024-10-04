import { CreateWorkflowDto, FindAllWorkflowsDto, UpdateWorkflowDto } from '~/server/services/dto/workflow.dto';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { cuidRule } from '~/server/utils/validation/ulid.rule';
import { TRPCError } from '@trpc/server';

export const workflowRouter = router({
  // create workflow
  create: protectedProcedure
    .input(
      z.object({
        projectId: cuidRule(),
        assistantId: cuidRule(),
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      const payload = CreateWorkflowDto.fromInput(input);
      const pass = await services.workflowService.canCreateWorkflowPolicy(payload, user);
      return await services.workflowService.create(payload);
    }),

  // re-create workflow from media
  reCreateFromMedia: protectedProcedure
    .input(
      z.object({
        workflowId: cuidRule(),
        mediaId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      // const pass = await workflowService.canReCreateFromMediaPolicy(input.workflowId, user);
      return await services.workflowService.reCreateFromMedia(input);
    }),

  // find workflow including steps
  full: protectedProcedure
    .input(
      z.object({
        workflowId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      const workflow = await services.workflowService.findFirstWithSteps(input.workflowId);

      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      // policy check
      services.workflowService.canAccessWorkflowPolicy(workflow.project.team.id, user);

      return workflow;
    }),

  // find workflow settings
  settings: protectedProcedure
    .input(
      z.object({
        workflowId: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      const workflow = await services.workflowService.findFirst(input.workflowId);

      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      // policy check
      services.workflowService.canAccessWorkflowPolicy(workflow.project.team.id, user);

      return workflow;
    }),
  // find all workflows for a project
  allForProject: protectedProcedure
    .input(
      z.object({
        projectId: cuidRule(),
        page: z.number().default(1),
      }),
    )
    .query(async ({ ctx: { services }, input }) => {
      const payload = FindAllWorkflowsDto.fromInput(input);

      const workflow = await services.workflowService.findAll(payload);

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
        projectId: cuidRule().optional(),
        page: z.number().default(1),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      return services.workflowService.findAllForUser(user.id, input?.projectId, input.page);
    }),

  // update workflow
  update: protectedProcedure
    .input(
      z.object({
        workflowId: cuidRule(),
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      const payload = UpdateWorkflowDto.fromInput(input);

      const pass = await services.workflowService.canUpdateWorkflowPolicy(payload, user);

      return services.workflowService.update(payload);
    }),

  // delete workflow
  delete: protectedProcedure
    .input(
      z.object({
        workflowId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      const pass = await services.workflowService.canDeleteWorkflowPolicy(input.workflowId, user);

      return await services.workflowService.delete(input.workflowId);
    }),

  deleteRows: protectedProcedure
    .input(
      z.object({
        workflowId: cuidRule(),
        orderColumns: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      // const pass = await workflowService.canDeleteRowsPolicy(input.workflowId, ctx.user);

      return await services.workflowService.deleteRows({
        workflowId: input.workflowId,
        orderColumns: input.orderColumns,
      });
    }),

  // update row contents to empty
  clearAllRows: protectedProcedure
    .input(
      z.object({
        workflowId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { services }, input }) => {
      // const pass = await workflowService.canClearRowsPolicy(input.workflowId, ctx.user);

      return await services.workflowService.clearAllRows({
        workflowId: input.workflowId,
      });
    }),
});
