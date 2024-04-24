import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulidx';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

const prisma = new PrismaClient();

async function main() {
  // create user
  const user = await prisma.user.upsert({
    where: { email: 'sven@svenson.ai' },
    update: {},
    create: {
      id: ulid().toLowerCase(),
      name: 'Sven Stadhouders',
      firstName: 'Sven',
      lastName: 'Stadhouders',
      email: 'sven@svenson.ai',
      password: await hashPassword(process.env.ADMIN_PASSWORD!),
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerifiedAt: new Date(),
    },
  });

  // create organization
  const org = await prisma.organisation.create({
    data: {
      id: ulid().toLowerCase(),
      name: 'Svenson Organisation',
    },
  });

  // create team
  const team = await prisma.team.create({
    data: {
      id: ulid().toLowerCase(),
      name: 'Svenson Team',
      organisation: { connect: { id: org.id } },
    },
  });

  // create team user
  await prisma.teamUser.create({
    data: {
      id: ulid().toLowerCase(),
      user: { connect: { id: user.id } },
      team: { connect: { id: team.id } },
    },
  });

  // create credit
  await prisma.credit.create({
    data: {
      id: ulid().toLowerCase(),
      user: { connect: { id: user.id } },
      amount: 1000,
    },
  });

  // console.log({ sven });
  // read json file and insert into db
  const path = join(__dirname, 'llm_providers.json');
  const data = readFileSync(path, 'utf8');
  const providers = JSON.parse(data);
  for (const provider of providers) {
    await prisma.largeLangModel.create({
      data: {
        id: ulid().toLowerCase(),
        provider: provider.provider,
        apiName: provider.apiName,
        description: provider.description,
        displayName: provider.displayName,
        contextSize: provider.contextSize,
        maxTokens: provider.maxTokens,
        multiModal: provider.multiModal,
        hidden: provider.hidden,
        free: provider.free,
      },
    });
  }
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
