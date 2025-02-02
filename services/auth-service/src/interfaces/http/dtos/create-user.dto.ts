import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrismaUserRole } from '../../../domain/entities/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ enum: PrismaUserRole })
  @IsEnum(PrismaUserRole)
  role: PrismaUserRole;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessHours?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;
}