import { PrismaClient } from '@prisma/client';
import { CompletionFactoryStatic } from '../factories/completionFactoryStatic';

// const prisma = new PrismaClient();

async function processJob(provider: string, model: string, data: any) {
  const { messages, temperature, maxTokens } = data;

  const completionFactory = new CompletionFactoryStatic(provider, model);

  const completion = await completionFactory.create({
    messages,
    temperature,
    maxTokens,
    stream: false,
  });

  return completion;
}

export default defineNitroPlugin((nitroApp) => {
  const { createWorker } = useBullmq();
  const { event } = useEvents();

  const stepCompletion = createWorker('RowCompletion', async (job) => {
    console.log(
      `Worker 'RowCompletion' is executing job of name: ${job.name}, data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    event('RowCompleted', job.data);
  });

  const groq_llama3_8b = createWorker(
    'groq-llama3-8b-8192',
    async (job) => {
      console.log(
        `Worker 'groq-llama3-8b-8192' is executing job of name: ${job.name}, data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
    {
      concurrency: 10,
      limiter: {
        max: 30,
        duration: 1000,
      },
    },
  );

  const openai_gpt_3_5_turbo = createWorker(
    'openai-gpt-3.5-turbo',
    async (job) => {
      console.log(
        `Worker 'openai-gpt-3.5-turbo' is executing job of name: ${job.name}, data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`,
      );
      // wait for 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
    {
      concurrency: 10,
      limiter: {
        max: 5000,
        duration: 1000,
      },
    },
  );

  const anthropic_claude_3_sonnet = createWorker(
    'anthropic-claude-3-sonnet-20240229',
    async (job) => {
      console.log(
        `Worker 'anthropic-claude-3-sonnet-20240229' is executing job of name: ${job.name}, data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
    {
      concurrency: 10,
      limiter: {
        max: 50,
        duration: 1000,
      },
    },
  )
    .on('failed', (job, err) => {
      // logger.error(`Worker ${name} failed job ${job?.id}: ${err}`);
    })
    .on('completed', (job) => {
      // logger.info(`Worker ${name} completed job ${job.id}`);
    })
    .on('drained', () => {
      // console.log(`Worker 'anthropic-claude-3-sonnet-20240229' is drained`);
      // logger.info(`Worker ${name} completed job ${job.id}`);
    });
});
