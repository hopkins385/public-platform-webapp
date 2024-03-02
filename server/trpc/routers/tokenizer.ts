import { z } from 'zod';
import { get_encoding as getEncoding } from 'tiktoken';
import { protectedProcedure, router } from '../trpc';

export const tokenizerRouter = router({
  // get one chat
  getTokens: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
      }),
    )
    .query(({ ctx, input }) => {
      const enc = getEncoding('cl100k_base');
      const charCount = input.content.length;
      const tokens = enc.encode(input.content);
      const tokenCount = tokens.length;
      return {
        tokens,
        tokenCount,
        charCount,
      };
    }),
});
