import { z } from 'zod';
import { VisionContentRule } from './vision-content.rule';
export const ChatMessageRule = () =>
  z.object({
    role: z.enum(['user', 'assistant']),
    message: z
      .object({
        content: z.string().min(1),
      })
      .or(VisionContentRule()),
  });
