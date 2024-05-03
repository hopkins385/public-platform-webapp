import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ProjectService } from '~/server/services/project.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
} from '~/server/services/dto/project.dto';
import { TRPCError } from '@trpc/server';

interface UserProjectPolicyPayload {
  project: any;
  user: any;
}

function userCanAccessProjectPolicy(payload: UserProjectPolicyPayload) {
  if (!payload.project) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Project not found',
    });
  }

  if (payload.project.teamId !== payload.user.teamId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this project',
    });
  }

  return true;
}

export const projectRouter = router({
  // create project
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const projectService = new ProjectService();
      const payload = CreateProjectDto.fromInput({
        teamId: ctx.user.teamId,
        ...input,
      });
      const project = await projectService.create(payload);
      return project;
    }),
  // find project by id
  first: protectedProcedure
    .input(
      z.object({
        id: ulidRule(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const projectService = new ProjectService();

      const project = await projectService.findFirst(input.id);

      const pass = userCanAccessProjectPolicy({
        project,
        user: ctx.user,
      });

      return project;
    }),
  // get all projects
  all: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const projectService = new ProjectService();
      const projects = await projectService.findMany(
        ctx.user.teamId,
        input.page,
      );
      return projects;
    }),
  // update project
  update: protectedProcedure
    .input(
      z.object({
        projectId: ulidRule(),
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const projectService = new ProjectService();
      const payload = UpdateProjectDto.fromInput(input);

      const project = await projectService.findFirst(payload.projectId);

      const pass = userCanAccessProjectPolicy({
        project,
        user: ctx.user,
      });

      const result = await projectService.update(payload);
      return result;
    }),
  // delete project
  delete: protectedProcedure
    .input(
      z.object({
        projectId: ulidRule(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const projectService = new ProjectService();

      const project = await projectService.findFirst(input.projectId);

      const pass = userCanAccessProjectPolicy({
        project,
        user: ctx.user,
      });

      const result = await projectService.softDelete(input.projectId);
      return result;
    }),
});
