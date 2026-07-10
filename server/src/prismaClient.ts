import { PrismaClient } from '@prisma/client';

const poolSize = parseInt(process.env.DATABASE_POOL_SIZE || '20', 10);
const poolTimeout = parseInt(process.env.DATABASE_POOL_TIMEOUT || '30', 10);

let databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  const sep = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl += `${sep}connection_limit=${poolSize}&pool_timeout=${poolTimeout}`;
}

const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
});

export default prisma;
