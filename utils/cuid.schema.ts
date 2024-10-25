import { z } from 'zod';
export const cuidSchema = z.string().trim().cuid2();
