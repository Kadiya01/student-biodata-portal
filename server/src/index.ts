import app from './app';
import prisma from './prismaClient';
import logger from './utils/logger';
import { queueManager } from './jobs/queueManager';

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

const server = app.listen(port, () => logger.info(`Server listening on port ${port}`));

async function shutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);
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
