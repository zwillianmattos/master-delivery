import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../../infrastructure/messaging/kafka/kafka.service';
import { UserEventTypes, UserEventPayload } from '../../../domain/events/user.events';
import { UserService } from '../../../application/services/user.service';
import { EachMessagePayload } from 'kafkajs';

@Injectable()
export class UserEventsConsumer implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    await this.kafkaService.subscribe(
      'user-events',
      'auth-service-group',
      async ({ message }: EachMessagePayload) => {
        const payload: UserEventPayload = JSON.parse(message.value?.toString() || '{}');
        await this.handleUserEvent(payload);
      },
    );
  }

  private async handleUserEvent(payload: UserEventPayload) {
    switch (payload.eventType) {
      case UserEventTypes.CREATED:
        await this.handleUserCreated(payload);
        break;
      case UserEventTypes.UPDATED:
        await this.handleUserUpdated(payload);
        break;
      case UserEventTypes.ROLE_CHANGED:
        await this.handleRoleChanged(payload);
        break;
    }
  }

  private async handleUserCreated(payload: UserEventPayload) {
    await this.userService.create({
      email: payload.email,
      password: payload.password,
      roles: payload.roles,
    });
  }

  private async handleUserUpdated(payload: UserEventPayload) {
    await this.userService.update(payload.id, {
      email: payload.email,
      roles: payload.roles,
      status: payload.status,
    });
  }

  private async handleRoleChanged(payload: UserEventPayload) {
    await this.userService.updateRoles(payload.id, payload.roles);
  }
}
