import { Queue, Worker, FlowProducer } from 'bullmq';
import { consola } from 'consola';

import type {
  WorkerOptions,
  ConnectionOptions,
  QueueOptions,
  RedisOptions,
  Processor,
  RepeatOptions,
  FlowChildJob,
  JobsOptions,
  QueueBaseOptions,
} from 'bullmq';
import { useRuntimeConfig } from '#imports';

const logger = consola.create({}).withTag('bullmq');

const queues: Queue[] = [];
const workers: Worker[] = [];
const cronJobs: {
  name: string;
  processor: () => Promise<void>;
  schedule: RepeatOptions;
}[] = [];

export function useBullmq() {
  const {
    redis: { host, password, port },
  } = useRuntimeConfig();

  const redisOptions: RedisOptions = {
    host,
    password,
    port: Number(port),
    retryStrategy: function (times: number) {
      return Math.max(Math.min(Math.exp(times), 20000), 1000);
    },
  };

  const connectionOptions: ConnectionOptions = {
    host,
    password,
    port: Number(port),
  };

  const createQueue = (name: string, opts?: Omit<QueueOptions, 'connection'>) => {
    // check if queue already exists
    const existingQueue = queues.find((queue) => queue.name === name);
    if (existingQueue) {
      logger.warn(`Queue ${name} already exists`);
      return existingQueue;
    }
    const defaultConnectionOptions: ConnectionOptions = {
      enableOfflineQueue: false,
    };

    const queue = new Queue(name, {
      connection: { ...redisOptions, ...defaultConnectionOptions },
      ...opts,
    });

    queues.push(queue);

    return queue;
  };

  const defaultJobOptions = {
    attempts: 0,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
      age: 24 * 3600, // keep up to 24 hours
    },
  } as Partial<JobsOptions>;

  function queueAddJob<T>(queueName: string, jobName: string, data: T, opts?: { delay?: number }) {
    const queue = getOrCreateQueue(queueName);
    return queue.add(jobName, data, { ...opts, ...defaultJobOptions });
  }

  const createWorker = (
    name: string,
    processor?: string | URL | null | Processor,
    opts?: Omit<WorkerOptions, 'connection'>,
  ) => {
    const defaultConnectionOptions: ConnectionOptions = {
      enableOfflineQueue: true,
      maxRetriesPerRequest: null,
    };

    const worker = new Worker(name, processor, {
      connection: { ...redisOptions, ...defaultConnectionOptions },
      ...opts,
    }).on('closed', () => {
      logger.info(`Worker ${name} stopped`);
    });

    workers.push(worker);

    return worker;
  };

  const addCronJob = (name: string, processor: () => Promise<void>, schedule: RepeatOptions) => {
    cronJobs.push({
      name,
      processor,
      schedule,
    });
  };

  /**
   * Returns the a queue by name. If queue is not found, it will return undefined but log a warning.
   *
   * @param name Name of the queue
   */
  const getQueue = (name: string, opt?: { log: boolean }) => {
    const queue = queues.find((queue) => queue.name === name)!;

    if (!queue && opt?.log) {
      logger.warn(`Queue ${name} not found`);
    }

    return queue;
  };

  const getOrCreateQueue = (name: string) => {
    return getQueue(name) ?? createQueue(name);
  };

  const getCronJob = (name: string) => {
    return cronJobs.find((cronJob) => cronJob.name === name);
  };

  /**
   * Flow
   */
  async function createFlow(parentName: string, parentQueueName: string, flowChildJobs: FlowChildJob[]) {
    const flowProducer = new FlowProducer({
      connection: connectionOptions,
    });
    const queue = getOrCreateQueue(parentQueueName);
    const flow = await flowProducer.add({
      name: parentName,
      queueName: queue.name,
      children: flowChildJobs,
    });
    return flow;
  }

  function getFlowProducer() {
    return new FlowProducer({
      connection: connectionOptions,
    });
  }

  return {
    queues,
    workers,
    connectionOptions,
    getOrCreateQueue,
    createQueue,
    queueAddJob,
    createWorker,
    getQueue,
    addCronJob,
    getCronJob,
    createFlow,
    getFlowProducer,
  };
}

// createWorker type
export type createWorker = ReturnType<typeof useBullmq>['createWorker'];
