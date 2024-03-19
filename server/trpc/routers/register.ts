import { UserService } from '~/server/services/user.service';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { verifyEmail } from '@devmehq/email-validator-js';

const ulidRule = z.string().toUpperCase().ulid();

export const registerRouter = router({
  newUser: publicProcedure
    .input(
      z.object({
        email: z.string().refine(
          async (email) => {
            const { validFormat, validSmtp, validMx } = await verifyEmail({
              emailAddress: email,
              verifyMx: true,
              verifySmtp: true,
              timeout: 3000,
            });
            return validFormat && validSmtp && validMx;
          },
          {
            message: 'Invalid email',
          },
        ),
        password: z.string().min(8).max(40),
        firstName: z.string().min(2).max(100),
        lastName: z.string().min(2).max(100),
        terms: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userService = new UserService(ctx.prisma);
      // wait 500ms
      await new Promise((resolve) => setTimeout(resolve, 500));
      return await userService.createNewUser(input);
    }),
  confirmEmail: publicProcedure
    .input(
      z.object({
        userId: ulidRule,
        token: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userService = new UserService(ctx.prisma);
      const user = await userService.confirmEmail(input);
      if (!user) {
        throw new Error('User not found');
      }
      return { success: true };
    }),
});
