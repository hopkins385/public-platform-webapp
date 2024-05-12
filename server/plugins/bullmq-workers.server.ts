import { AssistantJobService } from './../services/assistant-job.service';
import { WorkflowEvent } from '../utils/enums/workflow-event.enum';
import { QueueEnum } from '../utils/enums/queue.enum';
import { JobEnum } from '../utils/enums/job.enum';
import { trackTokens } from '../utils/track-tokens';

const assistantJobService = new AssistantJobService();

export default defineNitroPlugin((nitroApp) => {
  const { createWorker } = useBullmq();

  const tokenUsageQueue = createWorker(QueueEnum.TOKENUSAGE, async (job) => {
    switch (job.name) {
      case JobEnum.TRACKTOKENS:
        await trackTokens(job.data);
        break;
      default:
        throw new Error(
          `Invalid Job for Queue 'TokenUsage'. Job ${job.name} not found`,
        );
    }
  });

  const stepCompletion = createWorker('RowCompletion', async (job) => {
    const { event } = useEvents();
    const { data } = job;
    console.log(
      `Worker 'RowCompletion' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
    );
    event(WorkflowEvent.ROWCOMPLETED, data);
  });

  const openai_gpt_3_5_turbo = createWorker(
    'openai-gpt-3.5-turbo',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'openai-gpt-3.5-turbo' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
      );
      await assistantJobService.processJob(data);
    },
    {
      concurrency: 10,
      limiter: {
        max: 5000,
        duration: 1000,
      },
    },
  );

  const openai_gpt_4 = createWorker(
    'openai-gpt-4',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'openai-gpt-4' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
      );
      await assistantJobService.processJob(data);
    },
    {
      concurrency: 10,
      limiter: {
        max: 5000,
        duration: 1000,
      },
    },
  );

  const groq_llama3_8b = createWorker(
    'groq-llama3-8b-8192',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'groq-llama3-8b-8192' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
      );
      await assistantJobService.processJob(data);
    },
    {
      concurrency: 10,
      limiter: {
        max: 30,
        duration: 1000,
      },
    },
  );

  const groq_llama3_70b = createWorker(
    'groq-llama3-70b-8192',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'groq-llama3-70b-8192' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
      );
      await assistantJobService.processJob(data);
    },
    {
      concurrency: 10,
      limiter: {
        max: 30,
        duration: 1000,
      },
    },
  );

  const groq_mixtral_8x7b = createWorker(
    'groq-mixtral-8x7b-32768',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'groq-mixtral-8x7b-32768' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
      );
      await assistantJobService.processJob(data);
    },
    {
      concurrency: 10,
      limiter: {
        max: 30,
        duration: 1000,
      },
    },
  );

  const mixtral_8x7b_32768 = createWorker(
    'mistral-open-mixtral-8x7b',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'mistral-open-mixtral-8x7b' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
      );
      await assistantJobService.processJob(data);
    },
    {
      concurrency: 10,
      limiter: {
        max: 30,
        duration: 1000,
      },
    },
  );

  const anthropic_claude_3_sonnet = createWorker(
    'anthropic-claude-3-sonnet-20240229',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'anthropic-claude-3-sonnet-20240229' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
      );
      await assistantJobService.processJob(data);
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
