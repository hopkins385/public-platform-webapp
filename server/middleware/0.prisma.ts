import { eventHandler } from 'h3';

declare module 'h3' {
  interface H3EventContext {
    prisma: ExtendedPrismaClient;
  }
}

export default eventHandler((event) => {
  const { getClient } = usePrisma();
  event.context.prisma = getClient();
});
