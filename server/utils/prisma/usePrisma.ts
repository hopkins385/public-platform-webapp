import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';
import { consola } from 'consola';

let prisma: ExtendedPrismaClient;
const logger = consola.create({}).withTag('prisma-client');

function getExtendedClient() {
  return new PrismaClient({
    log: ['info', 'warn', 'error'], // 'query',  TODO: remove in production
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

export function usePrisma() {
  function getClient() {
    if (!prisma) {
      logger.info('Creating Prisma client');
      prisma = getExtendedClient();
    }
    return prisma;
  }

  return {
    getClient,
  };
}
