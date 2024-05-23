import { FirstUserMessageEventDto } from './../services/dto/event.dto';
import consola from 'consola';
import type { createWorker } from '../utils/bullmq/useBullmq';
import { CompletionFactoryStatic } from '../factories/completionFactoryStatic';

const logger = consola.create({}).withTag('chat-title-worker');

export class ChatTitleWorker {
  private readonly createWorker: createWorker;

  constructor() {
    const { createWorker } = useBullmq();
    this.createWorker = createWorker;
  }

  static run() {
    return new ChatTitleWorker().processJob();
  }

  processJob() {
    const worker = this.createWorker(
      QueueEnum.CREATE_CHAT_TITLE,
      async (job) => {
        const { data } = job;
        logger.info(
          `Worker 'chat-title' is executing job of name: ${job.name}, data: ${JSON.stringify(data)} at ${new Date().toISOString()}`,
        );
        const messages = [
          {
            role: 'system',
            content: `Your task is to create a chat title for this conversation.\n
               You will be rewarded with 1 credit for a good title.\n
               You will be penalized 1 credit for a bad title.\n
               You will be provided with the first message from the user.\n
               You use the first message from the user to create a chat title.\n
               You only respond with the chat title.\n`,
          },
          {
            role: 'user',
            content: payload.messageContent,
          },
        ];
        // 1. make a request to
        const completion = new CompletionFactoryStatic(
          'openai',
          'gpt-3.5-turbo',
        );
        const response = await completion.create({
          messages,
          maxTokens: 100,
          temperature: 0.5,
          stream: false,
        });
        const message = response?.choices[0];

        logger.info(`Chat title: ${message}`);
      },
    );

    worker.on('completed', (job) => {
      logger.info(`Job ${job.id} has completed`);
    });

    worker.on('failed', (job, err) => {
      logger.info(`Job ${job.id} has failed with ${err.message}`);
    });

    return worker;
  }
}
