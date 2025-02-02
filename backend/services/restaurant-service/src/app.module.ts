import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import * as Joi from 'joi';

import databaseConfig from './infrastructure/database/config/database.config';
import redisConfig from './config/redis.config';
import kafkaConfig from './config/kafka.config';

import { RestaurantsModule } from './application/restaurants/restaurants.module';

import { RedisService } from './infrastructure/cache/redis/redis.service';
import { PrismaService } from './infrastructure/database/prisma/prisma.service';
import { AuthService } from './infrastructure/auth/auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, kafkaConfig],
      validationSchema: Joi.object({
        // Database
        DATABASE_URL: Joi.string().required(),
        DATABASE_LOG_QUERIES: Joi.boolean().default(false),
        DATABASE_LOG_LEVEL: Joi.string().default('error,warn'),

        // Redis
        REDIS_URL: Joi.string().default('redis://localhost:6379'),
        REDIS_RETRY_ATTEMPTS: Joi.number().default(3),
        REDIS_RETRY_DELAY: Joi.number().default(1000),
        REDIS_TTL: Joi.number().default(3600),

        // Kafka
        KAFKA_CLIENT_ID: Joi.string().default('restaurant-service'),
        KAFKA_BROKERS: Joi.string().default('localhost:9092'),
        KAFKA_GROUP_ID: Joi.string().default('restaurant-service-group'),
        KAFKA_SSL: Joi.boolean().default(false),
        KAFKA_SASL_MECHANISM: Joi.string().optional(),
        KAFKA_SASL_USERNAME: Joi.string().optional(),
        KAFKA_SASL_PASSWORD: Joi.string().optional(),
      }),
    }),
    HttpModule,
    CqrsModule,
    RestaurantsModule,
  ],
  providers: [
    // Infrastructure
    AuthService,
    PrismaService,
    RedisService,
  ],
})
export class AppModule {}
