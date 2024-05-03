import { MediaService } from './../../services/media.service';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { ModelDto } from '~/server/services/dto/model.dto';

const mediaService = new MediaService();

const modelRules = z.object({
  id: ulidRule(),
  type: z.enum(['User', 'Document', 'DocumentItem', 'Project']),
});

export const mediaRouter = router({
  // create: protectedProcedure
  //   .input(
  //     z.object({
  //       name: z.string(),
  //       fileName: z.string(),
  //       filePath: z.string(),
  //       fileMime: z.string(),
  //       fileSize: z.number(),
  //     }),
  //   )
  //   .mutation(async ({ input, ctx }) => {
  //     const model = ModelDto.fromInput({ id: ctx.user.id, type: 'User' });
  //     const payload = CreateMediaDto.fromInput({ model, ...input });
  //     return mediaService.create(payload);
  //   }),

  find: protectedProcedure
    .input(
      z.object({
        mediaId: ulidRule(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return mediaService.findFirst(input.mediaId);
    }),

  findAllFor: protectedProcedure
    .input(
      z.object({
        model: modelRules,
      }),
    )
    .query(async ({ input, ctx }) => {
      const model = ModelDto.fromInput(input.model);
      return mediaService.findAllFor(model);
    }),

  paginateFindAllFor: protectedProcedure
    .input(
      z.object({
        model: modelRules,
        page: z.number().default(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const model = ModelDto.fromInput(input.model);
      return mediaService.paginateFindAllFor(model, input.page);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        mediaId: ulidRule(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return mediaService.delete(input.mediaId);
    }),
});
