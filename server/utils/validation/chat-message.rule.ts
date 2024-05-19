import { z } from 'zod';
export const ChatMessageRule = () =>
  z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1),
  });
