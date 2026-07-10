import { Queue, Worker, QueueEvents, Job, JobsOptions } from 'bullmq';
import redisConnection from '../config/redis';
import logger from '../utils/logger';

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  removeOnComplete: { count: 100, age: 86400 },
  removeOnFail: { count: 50, age: 604800 },
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
};

class QueueManager {
  private queues = new Map<string, Queue>();
  private workers = new Map<string, Worker>();
  private queueEvents = new Map<string, QueueEvents>();

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: redisConnection,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      });
      this.queues.set(name, queue);
      logger.info(`Queue "${name}" initialized`);
    }
    return this.queues.get(name)!;
  }

  async addJob(queueName: string, jobName: string, data: any, opts?: JobsOptions): Promise<Job> {
    const queue = this.getQueue(queueName);
    return queue.add(jobName, data, opts);
  }

  createWorker(
    queueName: string,
    processor: (job: Job) => Promise<any>
  ): Worker {
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName)!;
    }

    const worker = new Worker(
      queueName,
      async (job) => {
        logger.info(`Processing job "${job.name}" in queue "${queueName}"`, {
          jobId: job.id,
          data: job.data,
        });
        try {
          const result = await processor(job);
          logger.info(`Job "${job.name}" completed`, { jobId: job.id, queueName });
          return result;
        } catch (error) {
          logger.error(`Job "${job.name}" failed`, {
            jobId: job.id,
            queueName,
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      },
      { connection: redisConnection, concurrency: 5 }
    );

    worker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} in "${queueName}" failed`, {
        error: err.message,
        attemptsMade: job?.attemptsMade,
      });
    });

    worker.on('stalled', (jobId) => {
      logger.warn(`Job ${jobId} in "${queueName}" stalled`);
    });

    this.workers.set(queueName, worker);
    logger.info(`Worker for queue "${queueName}" started`);
    return worker;
  }

  createQueueEvents(queueName: string): QueueEvents {
    if (this.queueEvents.has(queueName)) {
      return this.queueEvents.get(queueName)!;
    }

    const events = new QueueEvents(queueName, { connection: redisConnection });

    events.on('failed', ({ jobId, failedReason }) => {
      logger.error(`Queue "${queueName}" job ${jobId} failed: ${failedReason}`);
    });

    events.on('completed', ({ jobId }) => {
      logger.info(`Queue "${queueName}" job ${jobId} completed`);
    });

    this.queueEvents.set(queueName, events);
    return events;
  }

  async closeAll(): Promise<void> {
    const closePromises: Promise<void>[] = [];
    for (const [name, queue] of this.queues) {
      closePromises.push(queue.close().then(() => { logger.info(`Queue "${name}" closed`); }));
    }
    for (const [name, worker] of this.workers) {
      closePromises.push(worker.close().then(() => { logger.info(`Worker "${name}" closed`); }));
    }
    for (const [name, events] of this.queueEvents) {
      closePromises.push(events.close().then(() => { logger.info(`QueueEvents "${name}" closed`); }));
    }
    await Promise.all(closePromises);
  }
}

export const queueManager = new QueueManager();

export { DEFAULT_JOB_OPTIONS };
