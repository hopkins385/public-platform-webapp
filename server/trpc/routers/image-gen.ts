import { FluxImageGenerator } from './../../utils/fluxImageGen';
import { ImageGenService } from './../../services/image-gen.service';
import { protectedProcedure, router } from '../trpc';
import { FluxProInputsSchema } from '~/schemas/fluxPro.schema';

const { apiKey } = useRuntimeConfig().flux;
const fluxImageGenerator = new FluxImageGenerator(apiKey);
const imageGenService = new ImageGenService(fluxImageGenerator);

export const imageGenRouter = router({
  generateImage: protectedProcedure.input(FluxProInputsSchema).query(async ({ ctx: { user }, input }) => {
    return await imageGenService.generateImages(user.id, input);
  }),
});
