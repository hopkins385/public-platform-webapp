import { z } from 'zod';
export const cuidRule = () => z.string().trim().cuid2();
export const idSchema = z.object({ id: cuidRule() });
