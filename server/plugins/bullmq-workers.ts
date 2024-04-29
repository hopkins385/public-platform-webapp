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
  const bullmq = useBullmq();

  const workflowStepCompletion = bullmq.createWorker(
    'StepCompletion',
    async (job) => {
      console.log(
        `Worker 'workflowStepCompletion' is executing job of name: ${job.name}, data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
  );

  const groq_llama3_8b_8192 = bullmq.createWorker(
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

  const openai_gpt_3_5_turbo = bullmq.createWorker(
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

  const anthropic_claude_3_sonnet_20240229 = bullmq.createWorker(
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
  );
});
