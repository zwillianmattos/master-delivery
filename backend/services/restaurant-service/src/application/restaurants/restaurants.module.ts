import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RestaurantsController } from '../../interfaces/http/controllers/restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { RedisService } from '@/infrastructure/cache/redis/redis.service';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from '@/infrastructure/auth/auth.service';

@Module({
  imports: [CqrsModule, HttpModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, PrismaService, RedisService, AuthService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
