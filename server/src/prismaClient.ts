import { PrismaClient } from '@prisma/client';

const poolSize = parseInt(process.env.DATABASE_POOL_SIZE || '20', 10);
const poolTimeout = parseInt(process.env.DATABASE_POOL_TIMEOUT || '30', 10);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
        ? process.env.DATABASE_URL + `?connection_limit=${poolSize}&pool_timeout=${poolTimeout}`
        : undefined,
    },
  },
});

export default prisma;
