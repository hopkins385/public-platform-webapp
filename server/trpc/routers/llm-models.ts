import { LLMService } from './../../services/llm.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const chatModelsRouter = router({
  getAll: protectedProcedure.query(({ ctx, input }) => {
    const llmService = new LLMService(ctx.prisma);
    return llmService.getCachedModels();
  }),
});
