import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RestaurantsService } from '../../../application/restaurants/restaurants.service';
import { Restaurant } from '../../../domain/entities/restaurant.entity';
import { RestaurantAuthGuard } from '../../../infrastructure/auth/guards/restaurant-auth.guard';
import { CreateRestaurantDto } from '../dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from '../dtos/update-restaurant.dto';

@ApiTags('restaurants')
@Controller('restaurants')
@ApiBearerAuth()
@UseGuards(RestaurantAuthGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiResponse({
    status: 200,
    description: 'List of all restaurants',
    type: [Restaurant],
  })
  async findAll(): Promise<Restaurant[]> {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a restaurant by id' })
  @ApiResponse({
    status: 200,
    description: 'The restaurant',
    type: Restaurant,
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found',
  })
  async findOne(@Param('id') id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantsService.findOne(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({
    status: 201,
    description: 'The restaurant has been successfully created',
    type: Restaurant,
  })
  async create(
    @Body() createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a restaurant' })
  @ApiResponse({
    status: 200,
    description: 'The restaurant has been successfully updated',
    type: Restaurant,
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const updatedRestaurant = await this.restaurantsService.update(
      id,
      updateRestaurantDto,
    );
    if (!updatedRestaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return updatedRestaurant;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a restaurant' })
  @ApiResponse({
    status: 200,
    description: 'The restaurant has been successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    const restaurant = await this.restaurantsService.findOne(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return this.restaurantsService.remove(id);
  }
}
