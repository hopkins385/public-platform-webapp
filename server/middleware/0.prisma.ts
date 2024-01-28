import { eventHandler } from 'h3';
import {
  getExtendedClient,
  type ExtendedPrismaClient,
} from '~/utils/getPrismaClient';

let prisma: ExtendedPrismaClient;

declare module 'h3' {
  interface H3EventContext {
    prisma: ExtendedPrismaClient;
  }
}

export default eventHandler((event) => {
  if (!prisma) {
    prisma = getExtendedClient();
  }
  event.context.prisma = prisma;
});
