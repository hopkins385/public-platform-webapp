/**
 * ! Executing this script will delete all data in your database and seed it with 10 organisation.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://snaplet-seed.netlify.app/seed/integrations/prisma
 */
import type { SeedClient } from '@snaplet/seed';
import { createSeedClient } from '@snaplet/seed';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createId } from '@paralleldrive/cuid2';
import { copycat } from '@snaplet/copycat';
import * as bcrypt from 'bcrypt';

async function seedLLMs(seed: SeedClient) {
  const path = join(__dirname, '..', 'llm_providers.json');
  const data = readFileSync(path, 'utf8');
  const providers = JSON.parse(data);
  const prData: any[] = [];
  for (const provider of providers) {
    prData.push({
      id: createId(),
      provider: provider.provider,
      apiName: provider.apiName,
      description: provider.description,
      displayName: provider.displayName,
      contextSize: provider.contextSize,
      maxTokens: provider.maxTokens,
      multiModal: provider.multiModal,
      hidden: provider.hidden,
      free: provider.free,
    });
  }
  return await seed.largeLangModel(prData);
}

async function seedOrganisations(seed: SeedClient) {
  return await seed.organisation((x) =>
    x(10, (ctx) => ({
      id: createId(),
      name: copycat.words(ctx.seed),
      description: copycat.sentence(ctx.seed),
      deletedAt: null,
    })),
  );
}

async function seedTeams(orgId: string, seed: SeedClient) {
  return await seed.team((x) =>
    x(10, (ctx) => ({
      id: createId(),
      name: copycat.words(ctx.seed),
      organisationId: orgId,
      deletedAt: null,
      // create for each team 10 users
      team_users: (x) =>
        x(10, (ctx1) => ({
          id: createId(),
          deletedAt: null,
          users: (ctx2) => ({
            id: createId(),
            firstName: copycat.firstName(ctx2.seed),
            lastName: copycat.lastName(ctx2.seed),
            name: copycat.fullName(ctx2.seed),
            email: copycat.email(ctx2.seed),
            deletedAt: null,
          }),
        })),
    })),
  );
}

async function seedDefaultUsers(seed: SeedClient) {
  // create user
  const data = [
    {
      id: createId(),
      name: 'Sven Stadhouders',
      firstName: 'Sven',
      lastName: 'Stadhouders',
      email: process.env.ADMIN_EMAIL!,
      password: () => bcrypt.hash(process.env.ADMIN_PASSWORD!, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      emailVerified: new Date(),
    },
    {
      id: createId(),
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      email: process.env.TESTER_EMAIL!,
      password: () => bcrypt.hash(process.env.TESTER_PASSWORD!, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      emailVerified: new Date(),
    },
  ];
  return await seed.user(data);
}

async function seedDefaults(seed: SeedClient, payload: { orgId: string; firstTeamId: string; secondTeamId: string }) {
  const { user: users } = await seedDefaultUsers(seed);

  // add default users to team
  await seed.teamUser([
    {
      id: createId(),
      teamId: payload.firstTeamId,
      userId: users[0].id,
      deletedAt: null,
    },
    {
      id: createId(),
      teamId: payload.secondTeamId,
      userId: users[1].id,
      deletedAt: null,
    },
  ]);

  // credits for each default user
  await seed.credit([
    {
      id: createId(),
      userId: users[0].id,
      amount: 1000,
    },
    {
      id: createId(),
      userId: users[1].id,
      amount: 1000,
    },
  ]);

  // Seed the database with roles

  const { role } = await seed.role([
    {
      id: createId(),
      name: 'admin',
    },
  ]);

  // connect user with role
  await seed.userRole([
    {
      id: createId(),
      userId: users[0].id,
      roleId: role[0].id,
    },
    {
      id: createId(),
      userId: users[1].id,
      roleId: role[0].id,
    },
  ]);

  // seed projects
  const { project } = await seed.project((x) =>
    x(1, (ctx) => ({
      id: createId(),
      name: 'Demo Project',
      description: 'This is a demo project',
      teamId: payload.firstTeamId,
      deletedAt: null,
    })),
  );
}

const main = async () => {
  const seed = await createSeedClient();

  // Truncate all tables in the database
  await seed.$resetDatabase();

  // Seed the database with large language models
  const { llm } = await seedLLMs(seed);
  // // Seed the database with roles
  // const { role } = await seed.role([
  //   {
  //     id: createId(),
  //     name: 'admin',
  //   },
  // ]);

  // Seed the database with 10 organisations
  const { organisation } = await seedOrganisations(seed);

  // create for each organisation 10 teams
  const teams = [];
  for (const org of organisation) {
    const { team } = await seedTeams(org.id, seed);
    teams.push(team);
  }

  const firstTeam = teams[0][0];
  const secondTeam = teams[0][1];

  // Seed the database with default users and so on
  const data = { orgId: organisation[0].id, firstTeamId: firstTeam.id, secondTeamId: secondTeam.id };
  await seedDefaults(seed, data);
};

main()
  .then(() => {
    console.log('Database seeded successfully!');
    process.exit();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
