import app from './app';
import prisma from './prismaClient';

const port = process.env.PORT || 4000;
const server = app.listen(port, () => console.log(`Server listening on ${port}`));

function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    prisma.$disconnect().then(() => {
      console.log('Server shut down.');
      process.exit(0);
    });
  });
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
