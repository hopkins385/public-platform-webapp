import { LLMService } from './../../services/llm.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

const llmService = new LLMService();

export const llmsRouter = router({
  all: protectedProcedure.query(({ ctx, input }) => {
    return llmService.getCachedModels();
  }),
});
