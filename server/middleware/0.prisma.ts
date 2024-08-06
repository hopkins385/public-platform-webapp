import consola from 'consola';
import { eventHandler } from 'h3';
import prisma, { type ExtendedPrismaClient } from '../prisma';

declare module 'h3' {
  interface H3EventContext {
    prisma: ExtendedPrismaClient;
  }
}

const logger = consola.create({}).withTag('server.prisma-middleware');

export default eventHandler((event) => {
  event.context.prisma = prisma;
});
