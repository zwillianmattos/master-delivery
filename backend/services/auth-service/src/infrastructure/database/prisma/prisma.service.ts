import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const url = configService.get<string>('database.url');
    const logQueries = configService.get<boolean>('database.logQueries', false);
    const logLevel = configService.get<string[]>('database.logLevel', ['error', 'warn']);

    super({
      datasources: {
        db: {
          url,
        },
      },
      log: logQueries ? logLevel.map(level => level as any) : ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
} 