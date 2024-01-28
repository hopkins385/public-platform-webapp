import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'sven@svenson.ai' },
    update: {},
    create: {
      name: 'Sven',
      email: 'sven@svenson.ai',
      password: await hashPassword('password'),
      lastLoginAt: new Date(),
    },
  });
  const bob = await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      name: 'Bob',
      email: 'bob@prisma.io',
      password: await hashPassword('123456789'),
      lastLoginAt: new Date(),
    },
  });
  const peter = await prisma.user.upsert({
    where: { email: 'peter@pan.de' },
    update: {},
    create: {
      name: 'Peter',
      email: 'peter@pan.de',
      password: await hashPassword('123456789'),
      lastLoginAt: new Date(),
    },
  });
  console.log({ alice, bob, peter });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
