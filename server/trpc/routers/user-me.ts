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
        firstName: z.string().trim().min(2).max(100),
        lastName: z.string().trim().min(2).max(100),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return await services.userService.updateUserName({
        userId: user.id,
        firstName: input.firstName,
        lastName: input.lastName,
      });
    }),
  // update password
  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().trim().min(6).max(100),
        newPassword: z.string().trim().min(6).max(100),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      throw new Error('Not implemented');
      // return await services.userService.updatePassword(user.id, input.currentPassword, input.newPassword);
    }),
  // delete me
  delete: protectedProcedure
    .input(
      z.object({
        userId: cuidRule(),
        userName: z.string().trim().min(2).max(100),
      }),
    )
    .mutation(async ({ ctx: { user, services }, input }) => {
      if (user.id !== input.userId.toLowerCase()) {
        throw new Error('Invalid user');
      }
      if (user.name !== input.userName) {
        throw new Error('Invalid user');
      }
      return await services.deletesUserAction.runPipeline({ usrId: input.userId });
    }),
});
