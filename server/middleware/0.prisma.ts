import { eventHandler } from 'h3';
import { getPrismaClient } from '~/server/utils/prisma/usePrisma';

declare module 'h3' {
  interface H3EventContext {
    prisma: ExtendedPrismaClient;
  }
}

export default eventHandler((event) => {
  event.context.prisma = getPrismaClient();
});
