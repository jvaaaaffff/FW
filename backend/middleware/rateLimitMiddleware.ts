import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from './cacheMiddleware';

// Rate limiting configurations
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string | { error: string; retryAfter: number };
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  const redisClient = getRedisClient();

  return rateLimit({
    store: redisClient ? new (RedisStore as any)({
      sendCommand: async (...args: any[]) => {
        return await (redisClient as any).call(...args);
      },
      prefix: 'rl:',
    }) : undefined,
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: (typeof options.message === 'string' ? options.message : undefined) || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
  });
};

// Different rate limiters for different endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 auth attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.'
});

export const otpLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 OTP requests per 5 minutes
  message: 'Too many OTP requests, please wait before requesting another.'
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false
});

export const productLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 product requests per minute
  skipSuccessfulRequests: true
});