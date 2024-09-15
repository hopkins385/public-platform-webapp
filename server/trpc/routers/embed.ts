import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
// import useEmbedDocuments from '../../utils/useEmbedDocuments';

// const { embedDocument, queryEmbedDocuments, chat } = useEmbedDocuments();

export const embedRouter = router({
  // get one chat
  embedDocument: protectedProcedure
    .input(
      z.object({
        path: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      // await embedDocument({
      //   path: input.path,
      //   vectorStore: ctx.vectorStore,
      // });
      return { success: true };
    }),
  queryDocuments: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      // return await queryEmbedDocuments(input.query, ctx.vectorStore);
    }),
  conversation: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.string().min(1),
            content: z.string().min(1),
          }),
        ) as z.ZodSchema<ChatMessage[]>,
      }),
    )
    .query(async ({ ctx, input }) => {
      // return await chat(input.messages, ctx.vectorStore);
    }),
});
