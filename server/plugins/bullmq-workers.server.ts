import type { WorkerOptions } from 'bullmq';
import { Queue } from '../utils/enums/queue.enum';
import consola from 'consola';
import {
  handleCreateChatTitle,
  handleOnActiveWorkflowJob,
  handleOnCompletedWorkflowJob,
  handleOnErrorWorkflowJob,
  handleOnFailedWorkflowJob,
  handleOnProgressWorkflowJob,
  handleOnReadyWorkflowJob,
  handleOnStalledWorkflowJob,
  handleTokenUsage,
  handleWorkflowJob,
  handleWorkflowRowCompleted,
} from '../handlers/workerHandlers';

interface WorkflowQueue {
  name: string;
  options: Partial<WorkerOptions>;
}

const logger = consola.create({}).withTag('bullmq-workers');

export default defineNitroPlugin(() => {
  const { createWorker } = useBullmq();

  /**
   * Create chat title worker
   */
  const createChatTitle = createWorker(Queue.CREATE_CHAT_TITLE, handleCreateChatTitle);

  /**
   * Track tokens usage worker
   */
  const tokenUsageQueue = createWorker(Queue.TOKEN_USAGE, handleTokenUsage);

  /**
   * Workflow row completed worker
   */
  const workflowRowCompletion = createWorker(Queue.WORKFLOW_ROW_COMLETED, handleWorkflowRowCompleted);

  const rateLimitDuration = 60 * 1000; // 1 minute // Time in milliseconds. During this time, a maximum of max jobs will be processed.
  const workerConcurrency = 10;
  const groqReqPerMin = 30;
  const mistralReqPerMin = 5 * 60;
  const openaiReqPerMin = 5 * 1000;
  const claudeReqPerMin = 4 * 1000;

  const workflowQueues: WorkflowQueue[] = [
    {
      name: 'groq-llama-3.2-11b-vision-preview',
      options: { concurrency: workerConcurrency, limiter: { max: groqReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'groq-llama-3.1-70b-versatile',
      options: { concurrency: workerConcurrency, limiter: { max: groqReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'groq-mixtral-8x7b-32768',
      options: { concurrency: workerConcurrency, limiter: { max: groqReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'mistral-mistral-large-latest',
      options: { concurrency: workerConcurrency, limiter: { max: mistralReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'openai-gpt-4o',
      options: { concurrency: workerConcurrency, limiter: { max: openaiReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'openai-gpt-4o-mini',
      options: { concurrency: workerConcurrency, limiter: { max: openaiReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'anthropic-claude-3-5-sonnet-20240620',
      options: { concurrency: workerConcurrency, limiter: { max: claudeReqPerMin, duration: rateLimitDuration } },
    },
    {
      name: 'anthropic-claude-3-opus-20240229',
      options: { concurrency: workerConcurrency, limiter: { max: claudeReqPerMin, duration: rateLimitDuration } },
    },
  ];

  workflowQueues.forEach((queue) => {
    createWorker(queue.name, handleWorkflowJob, queue.options)
      .on('ready', handleOnReadyWorkflowJob(queue.name))
      .on('active', handleOnActiveWorkflowJob)
      .on('progress', handleOnProgressWorkflowJob)
      .on('stalled', handleOnStalledWorkflowJob(queue.name))
      .on('completed', handleOnCompletedWorkflowJob)
      .on('failed', handleOnFailedWorkflowJob)
      .on('error', handleOnErrorWorkflowJob(queue.name));
  });

  logger.info('Bullmq workers loaded');
});
