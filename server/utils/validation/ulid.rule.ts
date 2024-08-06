import { z } from 'zod';
export const cuidRule = () => z.string().cuid2();
export const idSchema = z.object({ id: cuidRule() });
