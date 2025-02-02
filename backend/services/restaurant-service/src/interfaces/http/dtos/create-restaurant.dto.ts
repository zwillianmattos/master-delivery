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
  @ApiProperty({ description: 'The name of the restaurant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'The description of the restaurant' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The ID of the user who owns the restaurant' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(CuisineType)
  @IsNotEmpty()
  cuisineType: CuisineType;

  @IsArray()
  @IsOptional()
  businessHours?: string[];
}
