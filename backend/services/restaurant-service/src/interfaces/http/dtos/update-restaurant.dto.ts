import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateRestaurantDto {
  @ApiPropertyOptional({ description: 'The name of the restaurant' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'The description of the restaurant' })
  @IsString()
  @IsOptional()
  description?: string;
}
