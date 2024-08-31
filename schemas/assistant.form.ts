import * as z from 'zod';
import { toTypedSchema } from '@vee-validate/zod';

export const assistantSchema = z.object({
  teamId: z.string().cuid2(),
  llmId: z.string().cuid2(),
  title: z.string().min(3).max(255),
  description: z.string().min(3).max(255),
  systemPrompt: z.string().min(3).max(6000),
  isShared: z.boolean().default(false),
  functions: z.array(z.string()),
});

export const assistantFormSchema = toTypedSchema(assistantSchema);
