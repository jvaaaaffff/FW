import Redis from 'ioredis';

// Redis client for caching
let redisClient: Redis | null = null;
let isConnecting = false;

export const getRedisClient = (): Redis | null => {
  return redisClient;
};

export const initializeRedis = async (): Promise<void> => {
  if (isConnecting || redisClient) return;
  isConnecting = true;

  if (!process.env.REDIS_URL) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ℹ️  Redis not configured (REDIS_URL not set) — cache disabled.');
    }
    isConnecting = false;
    return;
  }

  try {
    const client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      connectTimeout: 5000,
      retryStrategy: (times: number) => {
        if (times > 5) {
          console.warn('⚠️  Redis unavailable after 5 attempts — disabling cache.');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    // Wait for connection with timeout
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Redis connection timeout'));
      }, 10000);

      client.on('connect', () => {
        clearTimeout(timeout);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Redis connected');
        }
        resolve();
      });

      client.on('error', (err: Error | any) => {
        clearTimeout(timeout);
        reject(err);
      });

      // Must call connect explicitly when not using lazyConnect
      client.connect().catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    redisClient = client;

    redisClient.on('error', (err: Error | any) => {
      console.warn('⚠️  Redis error:', err?.message || err?.code || err);
    });

    redisClient.on('end', () => {
      console.warn('⚠️  Redis connection ended.');
    });
  } catch (error) {
    console.warn('⚠️  Failed to connect to Redis — cache disabled:', error instanceof Error ? error.message : error);
    redisClient = null;
  } finally {
    isConnecting = false;
  }
};

// Cache middleware for API responses
export const cache = (duration: number = 300) => { // 5 minutes default
  return async (req: any, res: any, next: any) => {
    if (!redisClient) return next();

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(key);
      if (cached) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`📋 Cache hit: ${key}`);
        }
        return res.json(JSON.parse(cached));
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Cache read error:', error);
      } else {
        console.warn('Cache read error.');
      }
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function (data: any) {
      try {
        redisClient?.setex(key, duration, JSON.stringify(data));
        if (process.env.NODE_ENV === 'development') {
          console.log(`💾 Cache set: ${key} (${duration}s)`);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Cache write error:', error);
        } else {
          console.warn('Cache write error.');
        }
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

// Clear cache for specific patterns
export const clearCache = async (pattern: string) => {
  if (!redisClient) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ Cleared ${keys.length} cache keys: ${pattern}`);
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Cache clear error:', error);
    } else {
      console.warn('Cache clear error.');
    }
  }
};

// Health check for Redis
export const redisHealthCheck = async (): Promise<boolean> => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.ping();
    return true;
  } catch (error) {
    return false;
  }
};