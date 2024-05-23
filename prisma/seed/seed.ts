/**
 * ! Executing this script will delete all data in your database and seed it with 10 organisation.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from '@snaplet/seed';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ulid } from 'ulidx';

const main = async () => {
  const seed = await createSeedClient();

  // Truncate all tables in the database
  await seed.$resetDatabase();

  const path = join(__dirname, '..', 'llm_providers.json');
  const data = readFileSync(path, 'utf8');
  const providers = JSON.parse(data);
  const providersCount = providers.length;
  // Seed the database with the data from the JSON file
  await seed.largeLangModel((x) =>
    x(providersCount, (context) => {
      return {
        id: ulid().toLowerCase(),
        provider: providers[context.index].provider,
        apiName: providers[context.index].apiName,
        description: providers[context.index].description,
        displayName: providers[context.index].displayName,
        contextSize: providers[context.index].contextSize,
        maxTokens: providers[context.index].maxTokens,
        multiModal: providers[context.index].multiModal,
        hidden: providers[context.index].hidden,
        free: providers[context.index].free,
      };
    }),
  );

  //TODO: SEEEEDDDDD

  const { user } = await seed.user((x) =>
    x(2, () => ({ id: ulid().toLowerCase() })),
  );
  // Increase the number of organizations to 3
  const { organisation } = await seed.organisation((x) =>
    x(3, () => ({ id: ulid().toLowerCase() })),
  );

  // Type completion not working? You might want to reload your TypeScript Server to pick up the changes

  console.log('Database seeded successfully!');

  process.exit();
};

main();
