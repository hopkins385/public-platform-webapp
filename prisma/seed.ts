import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/bcrypt';
import { ulid } from 'ulidx';

const prisma = new PrismaClient();

async function main() {
  const sven = await prisma.user.upsert({
    where: { email: 'sven@svenson.ai' },
    update: {},
    create: {
      id: ulid().toLowerCase(),
      name: 'Sven Stadhouders',
      firstName: 'Sven',
      lastName: 'Stadhouders',
      email: 'sven@svenson.ai',
      password: await hashPassword(process.env.ADMIN_PASSWORD!),
    },
  });
  // console.log({ sven });
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
