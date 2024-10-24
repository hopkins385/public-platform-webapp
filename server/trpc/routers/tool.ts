import { protectedProcedure, router } from '../trpc';

export const toolRouter = router({
  getAllTools: protectedProcedure.query(async ({ ctx: { services } }) => {
    return await services.toolService.getAllTools();
  }),
});
