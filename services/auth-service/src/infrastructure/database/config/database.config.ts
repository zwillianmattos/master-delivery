import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
  logLevel: process.env.DATABASE_LOG_LEVEL?.split(',') || ['error', 'warn'],
})); 