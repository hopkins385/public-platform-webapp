import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { CreateProjectDto, UpdateProjectDto } from '~/server/services/dto/project.dto';

export const projectRouter = router({
  // create project
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      const payload = CreateProjectDto.fromInput({
        teamId: user.teamId,
        ...input,
      });

      // policy check
      services.projectService.canCreateProjectPolicy(payload);

      return await services.projectService.create(payload);
    }),

  // find project by id
  first: protectedProcedure
    .input(
      z.object({
        id: cuidRule(),
      }),
    )
    .query(async ({ ctx: { user, services }, input }) => {
      const project = await services.projectService.findFirst(input.id);

      // policy check
      services.projectService.canAccessProjectPolicy({
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
    .query(async ({ ctx: { user, services }, input }) => {
      return await services.projectService.findManyPaginated(user.teamId, input.page);
    }),

  // get all projects
  all: protectedProcedure.query(async ({ ctx: { user, services } }) => {
    return await services.projectService.findMany(user.teamId);
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
    .mutation(async ({ ctx: { user, services }, input }) => {
      const payload = UpdateProjectDto.fromInput(input);

      const project = await services.projectService.findFirst(payload.projectId);

      // policy check
      services.projectService.canAccessProjectPolicy({
        project,
        user: user,
      });

      return await services.projectService.update(payload);
    }),

  // delete project
  delete: protectedProcedure
    .input(
      z.object({
        projectId: cuidRule(),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      const project = await services.projectService.findFirst(input.projectId);

      // policy check
      services.projectService.canAccessProjectPolicy({
        project,
        user: user,
      });

      return await services.projectService.softDelete(input.projectId);
    }),
});
