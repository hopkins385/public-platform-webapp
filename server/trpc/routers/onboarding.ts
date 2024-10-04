import { protectedProcedure, router } from '../trpc';
import { z } from 'zod';

export const onboardingRouter = router({
  newUserAction: protectedProcedure
    .input(
      z.object({
        orgName: z.string().min(3).max(100),
      }),
    )
    .mutation(async ({ ctx: { user, actions }, input }) => {
      try {
        const result = await actions.createNewUserAction.run({
          userId: user.id,
          orgName: input.orgName,
        });
        return { success: true };
      } catch (error) {
        return { success: false };
      }
    }),
});
