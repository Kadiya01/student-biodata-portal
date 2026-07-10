import Redis from 'ioredis';
import logger from '../utils/logger';

const REDIS_ENABLED = !!process.env.REDIS_HOST && process.env.REDIS_HOST !== '127.0.0.1';

let redis: Redis | null = null;
let redisAvailable = false;

if (REDIS_ENABLED) {
  redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || 0,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis cache unavailable after 3 retries, disabling cache');
        redisAvailable = false;
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on('ready', () => {
    redisAvailable = true;
    logger.info('Redis cache connected');
  });

  redis.on('error', (err) => {
    redisAvailable = false;
    logger.warn('Redis cache error', { error: err.message });
  });

  redis.connect().catch((err) => {
    redisAvailable = false;
    logger.warn('Redis cache connection failed', { error: err.message });
  });
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redisAvailable || !redis) return null;
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttl = 300): Promise<void> {
  if (!redisAvailable || !redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch {
    // silently fail
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  if (!redisAvailable || !redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // silently fail
  }
}
