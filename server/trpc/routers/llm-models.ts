import { LLMService } from './../../services/llm.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import prisma from '~/server/prisma';

const llmService = new LLMService(prisma);

export const llmsRouter = router({
  all: protectedProcedure.query(({ ctx, input }) => {
    return llmService.getCachedModels();
  }),
});
