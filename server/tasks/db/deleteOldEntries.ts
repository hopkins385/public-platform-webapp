export default defineTask({
  meta: {
    name: 'db:cleanup',
    description: 'Run database cleanup task',
  },
  run({ payload, context }) {
    console.log('Running DB cleanup task...');
    return { result: 'Success' };
  },
});
