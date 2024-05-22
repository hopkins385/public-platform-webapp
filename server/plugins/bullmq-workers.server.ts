import { AssistantJobService } from './../services/assistant-job.service';
import { WorkflowEvent } from '../utils/enums/workflow-event.enum';
import { QueueEnum } from '../utils/enums/queue.enum';
import { JobEnum } from '../utils/enums/job.enum';
import { trackTokens } from '../utils/track-tokens';

const assistantJobService = new AssistantJobService();

export default defineNitroPlugin((nitroApp) => {
  const { createWorker } = useBullmq();

  const createChatTitleQueue = createWorker(
    QueueEnum.CREATE_CHAT_TITLE,
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'CreateChatTitle' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
      );
    },
  );

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

  const workflowRowCompletion = createWorker(
    QueueEnum.WORKFLOW_ROW_COMLETED,
    async (job) => {
      const { event } = useEvents();
      const { data } = job;
      console.log(
        `Worker 'RowCompletion' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
      );
      event(WorkflowEvent.ROWCOMPLETED, data);
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

  const mistral_small = createWorker(
    'mistral-small-latest',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'mistral-small-latest' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
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

  const mistral_large = createWorker(
    'mistral-large-latest',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'mistral-large-latest' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
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

  const openai_gpt_4o = createWorker(
    'openai-gpt-4o',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'openai-gpt-4o' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
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

  const anthropic_claude_3_haiku = createWorker(
    'anthropic-claude-3-haiku-20240307',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'anthropic-claude-3-haiku-20240307' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
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
  );

  const anthropic_claude_3_opus = createWorker(
    'anthropic-claude-3-opus-20240229',
    async (job) => {
      const { data } = job;
      console.log(
        `Worker 'anthropic-claude-3-opus-20240229' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
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
  );
});
