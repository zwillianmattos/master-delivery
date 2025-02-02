import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import * as Joi from 'joi';

// Infrastructure
import { PrismaService } from './infrastructure/database/prisma/prisma.service';
import { KafkaService } from './infrastructure/messaging/kafka/kafka.service';
import { RedisService } from './infrastructure/cache/redis/redis.service';
import { JwtConfigModule } from './infrastructure/auth/jwt/jwt.module';
import databaseConfig from './infrastructure/database/config/database.config';

// Application Services
import { UserService } from './application/services/user.service';
import { AuthService } from './application/services/auth.service';

// Command Handlers
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';

// Query Handlers
import {
  GetUserByEmailHandler,
  GetUserByIdHandler,
} from './application/queries/get-user/get-user.handler';

// HTTP Controllers
import { UserController } from './interfaces/http/controllers/user.controller';
import { AuthController } from './interfaces/http/controllers/auth.controller';

// Event Consumers
import { UserEventsConsumer } from './interfaces/messaging/consumers/user-events.consumer';

const CommandHandlers = [CreateUserHandler];
const QueryHandlers = [GetUserByEmailHandler, GetUserByIdHandler];
const EventConsumers = [UserEventsConsumer];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        DATABASE_LOG_QUERIES: Joi.boolean().default(false),
        DATABASE_LOG_LEVEL: Joi.string().default('error,warn'),
      }),
    }),
    CqrsModule,
    JwtConfigModule,
  ],
  controllers: [UserController, AuthController],
  providers: [
    // Infrastructure
    PrismaService,
    KafkaService,
    RedisService,

    // Application Services
    UserService,
    AuthService,

    // Command & Query Handlers
    ...CommandHandlers,
    ...QueryHandlers,

    // Event Consumers
    ...EventConsumers,
  ],
  exports: [UserService, AuthService],
})
export class AppModule {}
