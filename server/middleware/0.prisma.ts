import consola from 'consola';
import { eventHandler } from 'h3';
import { getPrismaClient } from '~/server/utils/prisma/usePrisma';

declare module 'h3' {
  interface H3EventContext {
    prisma: ExtendedPrismaClient;
  }
}

const logger = consola.create({}).withTag('server.prisma-middleware');

export default eventHandler((event) => {
  event.context.prisma = getPrismaClient();
});
