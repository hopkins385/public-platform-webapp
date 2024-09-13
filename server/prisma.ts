/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @link https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';
import cuid2Extension from 'prisma-extension-cuid2';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['info', 'warn', 'error'], // 'query'
  })
    .$extends(cuid2Extension())
    .$extends(pagination())
    .$extends({
      name: 'hasEmailVerified',
      result: {
        user: {
          hasEmailVerified: {
            needs: { emailVerified: true },
            compute(user) {
              return user.emailVerified !== null;
            },
          },
          hasOnboardingDone: {
            needs: { onboardedAt: true },
            compute(user) {
              return user.onboardedAt !== null;
            },
          },
        },
      },
    })
    .$extends({
      name: 'isExternal',
      result: {
        media: {
          isExternal: {
            needs: { filePath: true },
            compute(media) {
              return media.filePath.startsWith('http');
            },
          },
        },
      },
    });
};
export type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>;

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
