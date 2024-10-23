import { services } from '../services';
import { generateText, type CoreMessage } from 'ai';
import type { FirstUserMessageEventDto } from '../services/dto/event.dto';
import { AiModelFactory } from '../factories/aiModelFactory';
import type { Job } from 'bullmq';
import { trackTokensEvent } from '../events/track-tokens.event';
import { useEvents } from '../events/useEvents';
import type { AssistantJobDto } from '../services/dto/job.dto';
import consola from 'consola';
import socket from '../socket';

const logger = consola.create({}).withTag('bullmq-workers');

const { event } = useEvents();

export async function handleCreateChatTitle(job: Job<FirstUserMessageEventDto>) {
  const { data: payload } = job;
  // limit to max 1000 characters
  const firstMessage = payload.messageContent.slice(0, 1000);

  const messages = [
    {
      role: 'system',
      content: `You are a chat title generator.\n
Your task is to create a short chat title based on the provided text.\n
You always only respond with the chat title.`,
    },
    {
      role: 'user',
      content: firstMessage,
    },
  ] satisfies CoreMessage[];

  const { text } = await generateText({
    model: AiModelFactory.fromInput({ provider: 'openai', model: 'gpt-4o-mini' }),
    messages,
    maxTokens: 20,
  });

  // remove " from the beginning and end of the message
  const chatTitle = text.replace(/^"|"$/g, '');

  await services.chatService.updateChatTitle(payload.chatId, chatTitle);
  //
  // send socket event to user
  const event = `chat-${payload.chatId}-update-title-event`;
  const data = { chatId: payload.chatId, chatTitle };
  socket.emitEvent({ room: `user:${payload.userId}`, event, data });
}

export async function handleTokenUsage(job: Job) {
  switch (job.name) {
    case JobEnum.TRACKTOKENS:
      await trackTokensEvent(job.data);
      break;
    default:
      throw new Error(`Invalid Job for Queue 'TokenUsage'. Job ${job.name} not found`);
  }
}

export async function handleWorkflowRowCompleted(job: Job) {
  const { data } = job;
  event(WorkflowEvent.ROW_COMPLETED, data);
}

export async function handleWorkflowJob(job: Job<AssistantJobDto>) {
  const { data } = job;
  await services.assistantJobService.processJob(data);
}

export async function handleOnActiveWorkflowJob(job: Job<AssistantJobDto>) {
  const {
    data: { userId, documentItemId, workflowId },
  } = job;
  await services.documentItemService.updateProcessingStatus(documentItemId, 'pending');
  // event worker active
  event(WorkflowEvent.CELL_ACTIVE, { userId, workflowId });
}

export async function handleOnCompletedWorkflowJob(job: Job<AssistantJobDto>) {
  const {
    data: { userId, documentItemId, workflowId },
  } = job;

  await services.documentItemService.updateProcessingStatus(documentItemId, 'completed');
  // event worker completed
  event(WorkflowEvent.CELL_COMPLETED, { userId, workflowId });
}

export async function handleOnFailedWorkflowJob(job: Job<AssistantJobDto> | undefined, err: Error) {
  if (!job) return;

  const {
    data: { documentItemId },
  } = job;

  await services.documentItemService.updateProcessingStatus(documentItemId, 'failed');

  logger.error(`Workflow worker ${job.queueName} failed with error: ${err.message}`);
}

export function handleOnReadyWorkflowJob(workerName: string) {
  return async () => logger.info(`Workflow worker ${workerName} ready`);
}

export async function handleOnProgressWorkflowJob(job: Job<AssistantJobDto>, progress: number | object) {
  logger.info(`Workflow worker ${job.queueName} progress: ${progress}`);
}

export function handleOnStalledWorkflowJob(queueName: string) {
  return async () => logger.error(`Workflow worker ${queueName} stalled`);
}

export function handleOnErrorWorkflowJob(queueName: string) {
  return async (err: Error) => logger.error(`Workflow worker ${queueName} errored with error: ${err.message}`);
}
