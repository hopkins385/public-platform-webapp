import { FluxImageGenerator } from './../../utils/fluxImageGen';
import { ImageGenService } from './../../services/image-gen.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

const { apiKey } = useRuntimeConfig().flux;
const fluxImageGeneratorInstance = new FluxImageGenerator(apiKey);
const imageGenService = new ImageGenService(fluxImageGeneratorInstance);

export const imageGenRouter = router({
  generateImage: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await imageGenService.generateImages({ prompt: input.prompt.trim(), width: 1024, height: 1024 });
    }),
});
