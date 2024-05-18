import { z } from 'zod';
export const VisionContentRule = () =>
  z.array(
    z.union([
      z.object({
        type: z.literal('text'),
        text: z.string(),
      }),
      z.object({
        type: z.literal('image_url'),
        image_url: z.object({
          url: z.string(),
          detail: z.enum(['low', 'high', 'auto']).optional(),
        }),
      }),
    ]),
  );
