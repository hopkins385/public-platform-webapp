import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';

export function getExtendedClient() {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // TODO: remove in production
  })
    .$extends(pagination())
    .$extends({
      name: 'hasEmailVerified',
      result: {
        user: {
          hasEmailVerified: {
            needs: { emailVerifiedAt: true },
            compute(user) {
              return user.emailVerifiedAt !== null;
            },
          },
        },
      },
    });
}

export type ExtendedPrismaClient = ReturnType<typeof getExtendedClient>;
