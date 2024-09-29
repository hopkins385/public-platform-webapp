import { UserService } from '~/server/services/user.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import prisma from '~/server/prisma';

const userService = new UserService(prisma);

export const userMeRouter = router({
  // get me
  user: protectedProcedure.query(async ({ ctx: { user } }) => {
    return await userService.getUserById(user.id);
  }),
  // update me
  update: protectedProcedure
    .input(
      z.object({
        data: z.object({
          firstName: z.string().min(1).max(100),
          lastName: z.string().min(1).max(100),
        }),
      }),
    )
    .mutation(async ({ ctx: { user }, input }) => {
      const { data } = input;
      return await userService.updateUserName({ userId: user.id, ...data });
    }),
  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(6).max(100),
        newPassword: z.string().min(6).max(100),
      }),
    )
    .mutation(async ({ ctx: { user }, input }) => {
      return await userService.updatePassword(user.id, input.currentPassword, input.newPassword);
    }),
  delete: protectedProcedure
    .input(
      z.object({
        userId: cuidRule(),
        password: z.string().min(6).max(100),
      }),
    )
    .mutation(async ({ ctx: { user }, input }) => {
      if (user.id !== input.userId.toLowerCase()) {
        throw new Error('Invalid user');
      }
      return await userService.softDelete(user.id, input.password);
    }),
});
