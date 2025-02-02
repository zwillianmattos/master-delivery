import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByEmailQuery, GetUserByIdQuery } from './get-user.query';
import { UserService } from '../../services/user.service';
import { User } from '../../../domain/entities/user.entity';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler
  implements IQueryHandler<GetUserByEmailQuery>
{
  constructor(private readonly userService: UserService) {}

  async execute(query: GetUserByEmailQuery): Promise<User | null> {
    return this.userService.findByEmail(query.email);
  }
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly userService: UserService) {}

  async execute(query: GetUserByIdQuery): Promise<User | null> {
    return this.userService.findById(query.id);
  }
}
