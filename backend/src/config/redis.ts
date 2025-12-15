import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redis: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('⚠️ Redis connection failed, running without Redis');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    redis.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    redis.on('error', (err) => {
      console.warn('⚠️ Redis error:', err.message);
    });
  } else {
    console.log('⚠️ REDIS_URL not configured, running without Redis');
  }
} catch (err) {
  console.warn('⚠️ Redis initialization failed, running without Redis');
}

export { redis };
export default redis;
