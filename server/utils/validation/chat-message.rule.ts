import { z } from 'zod';
export const ChatMessageRule = () =>
  z.object({
    type: z.enum(['text', 'image']),
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1),
    visionContent: VisionContentRule().nullable().optional(), // TODO: this should be called "AttachmentContentRule"
  });
