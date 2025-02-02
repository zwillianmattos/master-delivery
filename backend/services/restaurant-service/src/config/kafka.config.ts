import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  clientId: process.env.KAFKA_CLIENT_ID || 'restaurant-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  groupId: process.env.KAFKA_GROUP_ID || 'restaurant-service-group',
  ssl: process.env.KAFKA_SSL === 'true',
  sasl: {
    mechanism: process.env.KAFKA_SASL_MECHANISM,
    username: process.env.KAFKA_SASL_USERNAME,
    password: process.env.KAFKA_SASL_PASSWORD,
  },
  retry: {
    initialRetryTime: 100,
    retries: 5,
  },
}));
