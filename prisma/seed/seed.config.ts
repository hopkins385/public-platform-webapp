import { SeedPrisma } from '@snaplet/seed/adapter-prisma';
import { defineConfig } from '@snaplet/seed/config';
import { PrismaClient } from '@prisma/client';
import cuid2Extension from 'prisma-extension-cuid2';

export default defineConfig({
  adapter: () => {
    const client = new PrismaClient().$extends(cuid2Extension());
    return new SeedPrisma(client);
  },
  select: ['!*_prisma_migrations'],
});
