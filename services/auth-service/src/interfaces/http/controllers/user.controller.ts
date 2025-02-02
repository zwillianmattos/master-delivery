import { Controller, Post, Body, Get, Param, UseGuards, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../application/commands/create-user/create-user.command';
import { GetUserByEmailQuery } from '../../../application/queries/get-user/get-user.query';
import { JwtAuthGuard } from '../../../infrastructure/auth/jwt/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/auth/jwt/guards/roles.guard';
import { PrismaUserRole } from '../../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 403, description: 'Forbidden - when trying to create admin without proper permissions' })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard) 
  async createUser(@Body() createUserDto: CreateUserDto) {
    if (createUserDto.role == PrismaUserRole.ADMIN) {
      const user = await this.queryBus.execute(new GetUserByEmailQuery(createUserDto.email));
      if (user.role !== PrismaUserRole.ADMIN) {
        throw new ForbiddenException('You are not authorized to create an admin user');
      }
    }

    const metadata = {
      name: createUserDto.name,
      phoneNumber: createUserDto.phoneNumber,
      ...(createUserDto.cnpj && { cnpj: createUserDto.cnpj }),
      ...(createUserDto.cpf && { cpf: createUserDto.cpf }),
      ...(createUserDto.businessHours && { businessHours: createUserDto.businessHours }),
      ...(createUserDto.vehiclePlate && { vehiclePlate: createUserDto.vehiclePlate }),
      ...(createUserDto.department && { department: createUserDto.department }),
    };

    const command = new CreateUserCommand(
      createUserDto.email,
      createUserDto.password,
      [createUserDto.role],
      metadata
    );

    return this.commandBus.execute(command);
  }

  @Get(':email')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserByEmail(@Param('email') email: string) {
    const query = new GetUserByEmailQuery(email);
    return this.queryBus.execute(query);
  }
} 