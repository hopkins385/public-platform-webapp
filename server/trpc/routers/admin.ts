import { UserService } from './../../services/user.service';
import { z } from 'zod';
import { adminProcedure, router } from '../trpc';

const pageRule = () => z.number().int().positive().default(1);
const limitRule = () => z.number().int().positive().default(20);

const userService = new UserService();

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
      return userService.getAllUsersByOrgId({
        orgId: ctx.user.orgId,
        page: input.page,
        limit: input.limit,
        search: input.search,
      });
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
      return userService.getAllTeamsByOrgId({
        orgId: ctx.user.orgId,
        page: input.page,
        limit: input.limit,
        search: input.search,
      });
    }),
});

export const adminRouter = router({
  users: adminUsersRouter,
  teams: adminTeamsRouter,
});
