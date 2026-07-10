import { Queue, Worker, QueueEvents, Job, JobsOptions } from 'bullmq';
import redisConnection from '../config/redis';
import logger from '../utils/logger';

let redisAvailable = true;

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

  getQueue(name: string): Queue | null {
    if (!redisAvailable) return null;

    if (!this.queues.has(name)) {
      try {
        const queue = new Queue(name, {
          connection: redisConnection,
          defaultJobOptions: DEFAULT_JOB_OPTIONS,
        });
        this.queues.set(name, queue);
        logger.info(`Queue "${name}" initialized`);
      } catch (err) {
        logger.warn(`Failed to initialize queue "${name}" — Redis unavailable`);
        redisAvailable = false;
        return null;
      }
    }
    return this.queues.get(name)!;
  }

  async addJob(queueName: string, jobName: string, data: any, opts?: JobsOptions): Promise<Job | null> {
    const queue = this.getQueue(queueName);
    if (!queue) {
      logger.warn(`Queue "${queueName}" not available — job "${jobName}" skipped`);
      return null;
    }
    try {
      return await queue.add(jobName, data, opts);
    } catch (err) {
      logger.error(`Failed to add job "${jobName}" to queue "${queueName}"`, {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  createWorker(
    queueName: string,
    processor: (job: Job) => Promise<any>,
    concurrency = 5
  ): Worker | null {
    if (!redisAvailable) {
      logger.warn(`Worker "${queueName}" not created — Redis unavailable`);
      return null;
    }
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName)!;
    }

    try {
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
        { connection: redisConnection, concurrency }
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
    } catch (err) {
      logger.warn(`Failed to create worker "${queueName}" — Redis unavailable`);
      redisAvailable = false;
      return null;
    }
  }

  createQueueEvents(queueName: string): QueueEvents | null {
    if (!redisAvailable) return null;

    try {
      const events = new QueueEvents(queueName, { connection: redisConnection });

      events.on('failed', ({ jobId, failedReason }) => {
        logger.error(`Queue "${queueName}" job ${jobId} failed: ${failedReason}`);
      });

      events.on('completed', ({ jobId }) => {
        logger.info(`Queue "${queueName}" job ${jobId} completed`);
      });

      return events;
    } catch {
      return null;
    }
  }

  async closeAll(): Promise<void> {
    const closePromises: Promise<void>[] = [];
    for (const [name, queue] of this.queues) {
      closePromises.push(queue.close().then(() => { logger.info(`Queue "${name}" closed`); }));
    }
    for (const [name, worker] of this.workers) {
      closePromises.push(worker.close().then(() => { logger.info(`Worker "${name}" closed`); }));
    }
    for (const [, events] of this.queueEvents) {
      closePromises.push(events.close());
    }
    await Promise.all(closePromises);
  }
}

export const queueManager = new QueueManager();

export { DEFAULT_JOB_OPTIONS };
