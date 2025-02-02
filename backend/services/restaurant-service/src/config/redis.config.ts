import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000', 10), // milliseconds
  ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // seconds
}));
