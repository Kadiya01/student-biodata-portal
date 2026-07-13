import app from './app';
import prisma from './prismaClient';
import logger from './utils/logger';
import { queueManager } from './jobs/queueManager';
import { bootstrap } from './bootstrap';

const port = process.env.PORT || 4000;

process.on('unhandledRejection', (reason: Error | any) => {
  logger.error('UNHANDLED REJECTION', {
    message: reason?.message || String(reason),
    stack: reason?.stack,
  });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION', {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

bootstrap()
  .then(() => {
    const server = app.listen(port, () => logger.info(`Server listening on port ${port}`));

    // Keep Neon free-tier DB alive by pinging every 4 minutes (suspend threshold is 5 min)
    const DB_PING_INTERVAL = 4 * 60 * 1000;
    const dbPingTimer = setInterval(async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (err: any) {
        logger.warn('DB keep-alive ping failed', { message: err?.message });
      }
    }, DB_PING_INTERVAL);
    dbPingTimer.unref();

    async function shutdown(signal: string) {
      logger.info(`${signal} received. Shutting down gracefully...`);
      clearInterval(dbPingTimer);
      server.close(async () => {
        await queueManager.closeAll().catch(() => {});
        await prisma.$disconnect();
        logger.info('Server shut down.');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((err) => {
    logger.error('Bootstrap failed', { message: err?.message, stack: err?.stack });
    process.exit(1);
  });
