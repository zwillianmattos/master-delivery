import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../application/commands/create-user/create-user.command';
import { GetUserByEmailQuery } from '../../../application/queries/get-user/get-user.query';
import { JwtAuthGuard } from '../../../interfaces/http/guards/jwt-auth.guard';
import { PrismaUserRole } from '../../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/interfaces/http/decorators/public.decorator';
import { Request } from 'express';

// Interface para estender o tipo Request com user
interface RequestWithUser extends Request {
  user?: {
    email: string;
    roles: PrismaUserRole[];
  };
}

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - when trying to create special roles without proper permissions',
  })
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: RequestWithUser) {
    // Se não houver usuário autenticado, força o role como CUSTOMER
    if (!req.user) {
      createUserDto.role = PrismaUserRole.CUSTOMER;
    } 
    // Se tentar criar roles especiais, verifica se é admin
    else if (
      createUserDto.role === PrismaUserRole.ADMIN || 
      createUserDto.role === PrismaUserRole.RESTAURANT || 
      createUserDto.role === PrismaUserRole.COURIER
    ) {
      const user = await this.queryBus.execute(new GetUserByEmailQuery(req.user.email));
      if (!user?.roles.includes(PrismaUserRole.ADMIN)) {
        throw new ForbiddenException('You are not authorized to create this type of user');
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
      metadata,
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
