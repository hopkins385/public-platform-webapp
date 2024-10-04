import { protectedProcedure, router } from '../trpc';

export const llmsRouter = router({
  all: protectedProcedure.query(async ({ ctx: { services }, input }) => {
    return await services.llmService.getCachedModels();
  }),
});
