import { z } from 'zod';
export const ulidRule = () => z.string().toUpperCase().ulid();
