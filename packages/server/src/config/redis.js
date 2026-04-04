import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

let redisClient = null;

export function getRedis() {
  if (!redisClient) {
    redisClient = new Redis(config.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: () => null,
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => {
      // Silence the basic ECONNREFUSED since we catch it in connectRedis
      if (err.code !== 'ECONNREFUSED') {
        logger.error({ err }, 'Redis error');
      }
    });
    redisClient.on('close', () => logger.warn('Redis connection closed'));
  }
  return redisClient;
}

export async function connectRedis() {
  try {
    const client = getRedis();
    logger.info('Attempting to connect to external Redis...');
    await client.connect();
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.message.includes('timeout') || err.message.toLowerCase().includes('close')) {
      logger.warn('External Redis connection failed. Falling back to in-memory Redis Mock...');
      redisClient = new RedisMock();
      redisClient.on('connect', () => logger.info('Redis (In-Memory Mock) connected'));
    } else {
      throw err;
    }
  }
}

export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
}
