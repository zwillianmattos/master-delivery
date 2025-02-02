import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateUserCommand,
  CreateUserCommandResult,
} from './create-user.command';
import { UserService } from '../../services/user.service';
import { ConflictException } from '@nestjs/common';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: CreateUserCommand): Promise<CreateUserCommandResult> {
    try {
      const user = await this.userService.create({
        email: command.email,
        password: command.password,
        roles: command.roles,
        metadata: command.metadata,
      });

      return {
        id: user.id,
        email: user.email,
        roles: user.roles,
        status: user.status,
        metadata: command.metadata,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }
}
