import { UserService } from '~/server/services/user.service';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { verifyEmail } from '@devmehq/email-validator-js';

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
});
