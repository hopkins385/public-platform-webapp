import { DocumentItemService } from './../services/document-item.service';
import { AssistantJobService } from './../services/assistant-job.service';
import { WorkflowEvent } from '../utils/enums/workflow-event.enum';
import { QueueEnum } from '../utils/enums/queue.enum';
import { JobEnum } from '../utils/enums/job.enum';
import { trackTokensEvent } from '../events/track-tokens.event';
import { CompletionFactoryStatic } from '../factories/completionFactoryStatic';
import { ChatService } from '../services/chat.service';
import type { FirstUserMessageEventDto } from '../services/dto/event.dto';
import { useEvents } from '../events/useEvents';
import type { WorkerOptions } from 'bullmq';
import consola from 'consola';
import type { AssistantJobDto } from '../services/dto/job.dto';

interface WorkflowWorker {
  name: string;
  options: WorkerOptions;
}

const prisma = getPrismaClient();
const assistantJobService = new AssistantJobService(prisma);
const documentItemService = new DocumentItemService(prisma);
const chatService = new ChatService(prisma);

const logger = consola.create({}).withTag('bullmq-workers');

export default defineNitroPlugin((nitroApp) => {
  const { createWorker } = useBullmq();

  const createChatTitle = createWorker(QueueEnum.CREATE_CHAT_TITLE, async (job) => {
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
  });

  const tokenUsageQueue = createWorker(QueueEnum.TOKENUSAGE, async (job) => {
    switch (job.name) {
      case JobEnum.TRACKTOKENS:
        await trackTokensEvent(job.data);
        break;
      default:
        throw new Error(`Invalid Job for Queue 'TokenUsage'. Job ${job.name} not found`);
    }
  });

  const workflowRowCompletion = createWorker(QueueEnum.WORKFLOW_ROW_COMLETED, async (job) => {
    const { event } = useEvents();
    const { data } = job;
    event(WorkflowEvent.ROWCOMPLETED, data);
  });

  const rateLimitDuration = 60 * 1000; // 1 minute
  const workerConcurrency = 10;
  const groqReqPerMin = 30;
  const mistralReqPerMin = 5 * 60;
  const openaiReqPerMin = 5 * 1000;
  const claudeReqPerMin = 4 * 1000;

  const workflowWorkers = [
    {
      name: 'groq-llama3-8b-8192',
      options: { concurrency: workerConcurrency, limiter: { max: groqReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'groq-llama3-70b-8192',
      options: { concurrency: workerConcurrency, limiter: { max: groqReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'groq-mixtral-8x7b-32768',
      options: { concurrency: workerConcurrency, limiter: { max: groqReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'mistral-small-latest',
      options: { concurrency: workerConcurrency, limiter: { max: mistralReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'mistral-large-latest',
      options: { concurrency: workerConcurrency, limiter: { max: mistralReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'openai-gpt-3.5-turbo',
      options: { concurrency: workerConcurrency, limiter: { max: openaiReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'openai-gpt-4',
      options: { concurrency: workerConcurrency, limiter: { max: openaiReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'openai-gpt-4o',
      options: { concurrency: workerConcurrency, limiter: { max: openaiReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'anthropic-claude-3-haiku-20240307',
      options: { concurrency: workerConcurrency, limiter: { max: claudeReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'anthropic-claude-3-sonnet-20240229',
      options: { concurrency: workerConcurrency, limiter: { max: claudeReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'anthropic-claude-3-opus-20240229',
      options: { concurrency: workerConcurrency, limiter: { max: claudeReqPerMin, duration: rateLimitDuration } },
    },
  ] as WorkflowWorker[];

  workflowWorkers.forEach((worker) => {
    createWorker(
      worker.name,
      async (job) => {
        const data = job.data as AssistantJobDto;
        return await assistantJobService.processJob(data);
      },
      worker.options,
    )
      .on('ready', () => {
        logger.info(`Workflow worker ${worker.name} ready`);
      })
      .on('active', async (job, prev) => {
        const data = job.data as AssistantJobDto;
        const { documentItemId } = data;
        await documentItemService.updateProcessingStatus(documentItemId, 'pending');
      })
      .on('progress', (job, progress) => {
        logger.info(`Workflow worker ${worker.name} progress: ${progress}`);
      })
      .on('stalled', () => {
        logger.warn(`Workflow worker ${worker.name} stalled`);
      })
      .on('completed', async (job, result, prev) => {
        const data = job.data as AssistantJobDto;
        const { documentItemId } = data;
        await documentItemService.updateProcessingStatus(documentItemId, 'completed');
      })
      .on('failed', async (job, err) => {
        const data = job?.data as AssistantJobDto;
        if (data) {
          const { documentItemId } = data;
          await documentItemService.updateProcessingStatus(documentItemId, 'failed');
        } else {
          logger.error('Failed to update document item status', data);
        }
        logger.error(`Workflow worker ${worker.name} failed with error: ${err.message}`);
      })
      .on('error', (err) => {
        logger.error(`Workflow worker ${worker.name} errored with error: ${err.message}`);
      });
  });

  logger.info('Bullmq workers loaded');
});
