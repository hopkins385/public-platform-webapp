import { AssistantJobService } from './../services/assistant-job.service';
import { WorkflowEvent } from '../utils/enums/workflow-event.enum';
import { QueueEnum } from '../utils/enums/queue.enum';
import { JobEnum } from '../utils/enums/job.enum';
import { trackTokensEvent } from '../events/track-tokens.event';
import { CompletionFactoryStatic } from '../factories/completionFactoryStatic';
import { ChatService } from '../services/chat.service';
import type { FirstUserMessageEventDto } from '../services/dto/event.dto';
import { useEvents } from '../events/useEvents';

const prisma = getPrismaClient();
const assistantJobService = new AssistantJobService(prisma);
const chatService = new ChatService(prisma);

export default defineNitroPlugin((nitroApp) => {
  const { createWorker } = useBullmq();

  const createChatTitle = createWorker(
    QueueEnum.CREATE_CHAT_TITLE,
    async (job) => {
      const payload = job.data as FirstUserMessageEventDto;

      // limit to max 1000 characters
      const firstMessage = payload.messageContent.slice(0, 1000);

      const messages = [
        {
          role: 'system',
          content: `Your task is to create a very short chat title for this conversation based on the user message.\n
           You only respond with the chat title.\n
           You will be provided with the user message encapsulated in three hyphens.\n
           You always respond in the exact same language as the user message.\n`,
        },
        {
          role: 'user',
          content: `"""${firstMessage}"""`,
        },
      ];
      // 1. make a request to
      const completion = new CompletionFactoryStatic('openai', 'gpt-3.5-turbo');
      const response = await completion.create({
        messages,
        maxTokens: 20,
        temperature: 0.5,
        stream: false,
      });
      const message = response.choices[0].message.content;

      // remove " from the beginning and end of the message
      const chatTitle = message.replace(/^"|"$/g, '');

      await chatService.updateChatTitle(payload.chatId, chatTitle);
    },
  );

  const tokenUsageQueue = createWorker(QueueEnum.TOKENUSAGE, async (job) => {
    switch (job.name) {
      case JobEnum.TRACKTOKENS:
        await trackTokensEvent(job.data);
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
