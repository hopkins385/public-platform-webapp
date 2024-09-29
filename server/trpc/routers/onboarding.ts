import { CreatesNewUserAction } from '~/server/actions/createsNewUserAction';
import { protectedProcedure, router } from '../trpc';
import prisma from '~/server/prisma';
import { z } from 'zod';

const createNewUserAction = new CreatesNewUserAction(prisma);

export const onboardingRouter = router({
  newUserAction: protectedProcedure
    .input(
      z.object({
        orgName: z.string().min(3).max(100),
      }),
    )
    .mutation(async ({ ctx: { user }, input }) => {
      try {
        const result = await createNewUserAction.run({
          userId: user.id,
          orgName: input.orgName,
        });
        return { success: true };
      } catch (error) {
        return { success: false };
      }
    }),
});
