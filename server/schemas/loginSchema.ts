// loginSchema.ts
import type { DefaultSession } from 'next-auth';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((email) => email.trim().toLowerCase()),
  password: z.string().min(6).max(100),
});

export interface CustomSessionUserData {
  id: string;
  orgId: string;
  teamId: string;
  roles: string[];
  projectIds: string[];
  credits: number;
  onboardingDone: boolean;
}

export type SessionUser = CustomSessionUserData & DefaultSession['user'];
