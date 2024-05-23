import { TeamService } from '~/server/services/team.service';
import { UserService } from '~/server/services/user.service';
import { z } from 'zod';
import { adminProcedure, router } from '../trpc';

const pageRule = () => z.number().int().positive().default(1);
const limitRule = () => z.number().int().positive().default(20);

const prisma = getPrismaClient();
const userService = new UserService(prisma);
const teamService = new TeamService(prisma);

const adminUsersRouter = router({
  allPaginated: adminProcedure
    .input(
      z.object({
        page: pageRule(),
        limit: limitRule(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await userService.getAllUsersByOrgId({
        orgId: ctx.user.orgId,
        page: input.page,
        limit: input.limit,
        search: input.search,
      });
    }),

  deleteUser: adminProcedure
    .input(z.object({ id: ulidRule() }))
    .mutation(async ({ ctx, input }) => {
      return await userService.softDeleteUser(input.id, ctx.user.orgId);
    }),
});

const adminTeamsRouter = router({
  allPaginated: adminProcedure
    .input(
      z.object({
        page: pageRule(),
        limit: limitRule(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await teamService.getAllTeamsByOrgId({
        orgId: ctx.user.orgId,
        page: input.page,
        limit: input.limit,
        search: input.search,
      });
    }),

  deleteTeam: adminProcedure
    .input(z.object({ id: ulidRule() }))
    .mutation(async ({ ctx, input }) => {
      return await teamService.softDeleteTeam(input.id, ctx.user.orgId);
    }),
});

export const adminRouter = router({
  users: adminUsersRouter,
  teams: adminTeamsRouter,
});
