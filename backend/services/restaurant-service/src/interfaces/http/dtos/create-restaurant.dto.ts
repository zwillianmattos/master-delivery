import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';

export enum CuisineType {
  ITALIAN = 'ITALIAN',
  JAPANESE = 'JAPANESE',
  BRAZILIAN = 'BRAZILIAN',
  FAST_FOOD = 'FAST_FOOD',
  // Add more as needed
}

export class CreateRestaurantDto {
  @ApiProperty({
    description: 'The name of the restaurant',
    example: 'Restaurant Name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'The description of the restaurant',
    example: 'This is a description of the restaurant',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The ID of the user who owns the restaurant',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The address of the restaurant',
    example: '123 Main St, Anytown, USA',
  })
  address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The phone number of the restaurant',
    example: '1234567890',
  })
  phone: string;

  @IsEnum(CuisineType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The cuisine type of the restaurant',
    example: 'ITALIAN',
  })
  cuisineType: CuisineType;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The business hours of the restaurant',
    example: ['09:00-22:00'],
  })
  businessHours?: string[];
}
