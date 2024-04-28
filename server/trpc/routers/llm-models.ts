import { LLMService } from './../../services/llm.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const llmsRouter = router({
  all: protectedProcedure.query(({ ctx, input }) => {
    const llmService = new LLMService(ctx.prisma);
    return llmService.getCachedModels();
  }),
});
