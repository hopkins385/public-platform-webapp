import { UserService } from '~/server/services/user.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

const userService = new UserService();

export const userMeRouter = router({
  // get me
  user: protectedProcedure.query(async ({ ctx }) => {
    return await userService.getUserById(ctx.user.id);
  }),
  // update me
  update: protectedProcedure
    .input(
      z.object({
        data: z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data } = input;
      const name = `${data.firstName} ${data.lastName}`;
      // wait for 500 ms to show the loading state
      await new Promise((resolve) => setTimeout(resolve, 500));
      // return await .user.update({
      //   where: { id: ctx.user.id },
      //   data: { name, ...data },
      // });
    }),
  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(6).max(100),
        newPassword: z.string().min(6).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return userService.updatePassword(
        ctx.user.id,
        input.currentPassword,
        input.newPassword,
      );
    }),
  delete: protectedProcedure
    .input(
      z.object({
        userId: ulidRule(),
        password: z.string().min(6).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id !== input.userId.toLowerCase()) {
        throw new Error('Invalid user');
      }
      return userService.softDelete(ctx.user.id, input.password);
    }),
});
