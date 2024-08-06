import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ProjectService } from '~/server/services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '~/server/services/dto/project.dto';
import prisma from '~/server/prisma';

const projectService = new ProjectService(prisma);

export const projectRouter = router({
  // create project
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx: { user }, input }) => {
      const payload = CreateProjectDto.fromInput({
        teamId: user.teamId,
        ...input,
      });

      // policy check
      projectService.canCreateProjectPolicy(payload);

      return await projectService.create(payload);
    }),

  // find project by id
  first: protectedProcedure
    .input(
      z.object({
        id: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user }, input }) => {
      const project = await projectService.findFirst(input.id);

      // policy check
      projectService.canAccessProjectPolicy({
        project,
        user: user,
      });

      return project;
    }),

  // get all projects
  allPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1).optional(),
      }),
    )
    .query(async ({ ctx: { user }, input }) => {
      return await projectService.findManyPaginated(user.teamId, input.page);
    }),

  // get all projects
  all: protectedProcedure.query(async ({ ctx: { user } }) => {
    return await projectService.findMany(user.teamId);
  }),

  // update project
  update: protectedProcedure
    .input(
      z.object({
        projectId: cuidRule(),
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx: { user }, input }) => {
      const payload = UpdateProjectDto.fromInput(input);

      const project = await projectService.findFirst(payload.projectId);

      // policy check
      projectService.canAccessProjectPolicy({
        project,
        user: user,
      });

      return await projectService.update(payload);
    }),

  // delete project
  delete: protectedProcedure
    .input(
      z.object({
        projectId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { user }, input }) => {
      const project = await projectService.findFirst(input.projectId);

      // policy check
      projectService.canAccessProjectPolicy({
        project,
        user: user,
      });

      return await projectService.softDelete(input.projectId);
    }),
});
