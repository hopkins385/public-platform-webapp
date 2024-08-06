import { TeamService } from '~/server/services/team.service';
import { UserService } from '~/server/services/user.service';
import { z } from 'zod';
import { adminProcedure, router } from '../trpc';
import { CreateUserByAdminDto, UpdateUserByAdminDto } from '~/server/services/dto/admin-user.dto';
import prisma from '~/server/prisma';
import { cuidRule, idSchema } from '~/server/utils/validation/ulid.rule';

const pageRule = () => z.number().int().positive().default(1);
const limitRule = () => z.number().int().positive().default(20);

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
    .query(async ({ ctx: { user }, input }) => {
      return await userService.getAllUsersByOrgId({
        orgId: user.orgId,
        page: input.page,
        limit: input.limit,
        search: input.search,
      });
    }),

  first: adminProcedure.input(idSchema).query(async ({ input }) => {
    const user = await userService.getUserById(input.id);
    return user;
  }),

  create: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
        password: z.string().optional(),
        isAdmin: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx: { user }, input }) => {
      const randomString = Math.random().toString(36).substring(7);
      return await userService.createNewUserByAdmin(
        CreateUserByAdminDto.fromInput({
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          password: input.password ?? randomString,
          isAdmin: input.isAdmin,
          teamId: user.teamId,
        }),
      );
    }),

  update: adminProcedure
    .input(
      z.object({
        id: cuidRule(),
        email: z.string().email().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        isAdmin: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await userService.updateByAdmin(
        UpdateUserByAdminDto.fromInput({
          userId: input.id,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          isAdmin: input.isAdmin,
        }),
      );
    }),

  delete: adminProcedure.input(idSchema).mutation(async ({ ctx: { user }, input }) => {
    return await userService.softDeleteUser(input.id, user.orgId);
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
    .query(async ({ ctx: { user }, input }) => {
      return await teamService.getAllTeamsByOrgId({
        orgId: user.orgId,
        page: input.page,
        limit: input.limit,
        search: input.search,
      });
    }),

  deleteTeam: adminProcedure.input(idSchema).mutation(async ({ ctx: { user }, input }) => {
    return await teamService.softDeleteTeam(input.id, user.orgId);
  }),
});

export const adminRouter = router({
  users: adminUsersRouter,
  teams: adminTeamsRouter,
});
