import { protectedProcedure, router } from '../trpc';
import { FluxProInputsSchema } from '~/server/schemas/fluxPro.schema';

export const imageGenRouter = router({
  generateImage: protectedProcedure.input(FluxProInputsSchema).query(async ({ ctx: { user, services }, input }) => {
    return await services.imageGenService.generateImages(user.id, input);
  }),
});
