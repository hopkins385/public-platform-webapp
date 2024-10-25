import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const userMeRouter = router({
  // get me
  user: protectedProcedure.query(async ({ ctx: { user, services } }) => {
    return await services.userService.getUserById(user.id);
  }),
  // update me
  update: protectedProcedure
    .input(
      z.object({
        data: z.object({
          firstName: z.string().trim().min(2).max(100),
          lastName: z.string().trim().min(2).max(100),
        }),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      const { data } = input;
      return await services.userService.updateUserName({ userId: user.id, ...data });
    }),
  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().trim().min(6).max(100),
        newPassword: z.string().trim().min(6).max(100),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      return await services.userService.updatePassword(user.id, input.currentPassword, input.newPassword);
    }),
  delete: protectedProcedure
    .input(
      z.object({
        userId: cuidRule(),
        password: z.string().trim().min(6).max(100),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      if (user.id !== input.userId.toLowerCase()) {
        throw new Error('Invalid user');
      }
      return await services.userService.softDelete(user.id, input.password);
    }),
});
