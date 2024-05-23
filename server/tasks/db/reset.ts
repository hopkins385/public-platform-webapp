import { execSync } from 'child_process';
import type { H3EventContext } from 'h3';

export default defineTask({
  meta: {
    name: 'db:reset',
    description: 'Run database reset task',
  },
  run({ payload, context }) {
    console.log('Running DB reset task...');
    // Reset the database
    // npx prisma db push --force-reset && npx prisma db seed
    // execSync('npx prisma db push --force-reset && npx prisma db seed');

    // Run the migrations
    return { result: 'success' };
  },
});
