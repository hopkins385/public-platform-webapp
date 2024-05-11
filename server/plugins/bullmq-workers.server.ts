import { DocumentItemService } from './../services/document-item.service';
import { DocumentService } from './../services/document.service';
import { CompletionFactoryStatic } from '../factories/completionFactoryStatic';
import type { AssistantJobDto } from '../services/dto/job.dto';
import { WorkflowEvent } from '../utils/enums/workflow-event.enum';

async function processJob(data: AssistantJobDto) {
  const documentItemService = new DocumentItemService();
  const {
    llmProvider,
    llmNameApi,
    temperature,
    maxTokens,
    assistantId,
    prevDocumentItemId,
    documentItemId,
    systemPrompt,
  } = data;

  const completionFactory = new CompletionFactoryStatic(
    llmProvider,
    llmNameApi,
  );

  // wait 500ms
  // await new Promise((resolve) => setTimeout(resolve, 500));

  const documentItem = await documentItemService.findFirst(documentItemId);
  if (!documentItem) return;
  // if (documentItem.status === 'completed') return;
  // if (documentItem.content === '') return;

  // previous document item
  if (!prevDocumentItemId) return;
  const prevDocumentItem =
    await documentItemService.findFirst(prevDocumentItemId);

  const messages = [
    {
      role: 'system',
      content: data.systemPrompt,
    },
    {
      role: 'user',
      content: prevDocumentItem?.content,
    },
  ];

  const response = await completionFactory.create({
    messages,
    temperature,
    maxTokens: 100,
    stream: false,
  });

  const message = response?.choices[0]?.message.content || 'low';

  const update = await documentItemService.update({
    documentItemId,
    content: message,
    status: 'completed',
  });
}

export default defineNitroPlugin((nitroApp) => {
  const { createWorker } = useBullmq();
  const { event } = useEvents();

  const stepCompletion = createWorker('RowCompletion', async (job) => {
    console.log(
      `Worker 'RowCompletion' is executing job of name: ${job.name}, data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`,
    );
    event(WorkflowEvent.ROWCOMPLETED, job.data);
  });

  const openai_gpt_3_5_turbo = createWorker(
    'openai-gpt-3.5-turbo',
    async (job) => {
      console.log(
        `Worker 'openai-gpt-3.5-turbo' is executing job of name: ${job.name}, data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`,
      );
      await processJob(job.data);
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
      console.log(
        `Worker 'groq-llama3-8b-8192' is executing job of name: ${job.name}, data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`,
      );
      await processJob(job.data);
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
      console.log(
        `Worker 'anthropic-claude-3-sonnet-20240229' is executing job of name: ${job.name}, data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`,
      );
      await processJob(job.data);
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
