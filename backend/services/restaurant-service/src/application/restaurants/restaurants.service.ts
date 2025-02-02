import { Injectable } from '@nestjs/common';
import { RedisService } from '../../infrastructure/cache/redis/redis.service';
import { Restaurant } from '../../domain/entities/restaurant.entity';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

type CreateRestaurantDto = {
  name: string;
  description?: string;
  userId: string;
};

type UpdateRestaurantDto = {
  name?: string;
  description?: string;
};

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  private mapToEntity(data: any): Restaurant {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.userId,
      menus: data.menus,
      categories: data.categories,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      address: data.address || '',
      phone: data.phone || '',
      openingHours: data.openingHours || '',
      cuisineType: data.cuisineType || '',
      rating: data.rating || 0,
      isActive: data.isActive ?? true,
    };
  }

  async findAll(): Promise<Restaurant[]> {
    const cachedData =
      await this.redisService.get<Restaurant[]>('restaurants:all');
    if (cachedData) {
      return cachedData;
    }

    const restaurants = await this.prisma.restaurant.findMany({
      include: {
        menus: true,
        categories: true,
      },
    });

    const mappedRestaurants = restaurants.map(this.mapToEntity);
    await this.redisService.set('restaurants:all', mappedRestaurants);
    return mappedRestaurants;
  }

  async findOne(id: string): Promise<Restaurant | null> {
    const cachedData = await this.redisService.get<Restaurant>(
      `restaurant:${id}`,
    );
    if (cachedData) {
      return cachedData;
    }

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        menus: true,
        categories: true,
      },
    });

    if (!restaurant) {
      return null;
    }

    const mappedRestaurant = this.mapToEntity(restaurant);
    await this.redisService.set(`restaurant:${id}`, mappedRestaurant);
    return mappedRestaurant;
  }

  async create(data: CreateRestaurantDto): Promise<Restaurant> {
    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: data.name,
        description: data.description,
        userId: data.userId,
      },
      include: {
        menus: true,
        categories: true,
      },
    });

    const mappedRestaurant = this.mapToEntity(restaurant);
    await this.redisService.set(
      `restaurant:${restaurant.id}`,
      mappedRestaurant,
    );
    await this.redisService.delete('restaurants:all');

    return mappedRestaurant;
  }

  async update(
    id: string,
    data: UpdateRestaurantDto,
  ): Promise<Restaurant | null> {
    const restaurant = await this.prisma.restaurant.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        menus: true,
        categories: true,
      },
    });

    const mappedRestaurant = this.mapToEntity(restaurant);
    await this.redisService.set(`restaurant:${id}`, mappedRestaurant);
    await this.redisService.delete('restaurants:all');

    return mappedRestaurant;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.restaurant.delete({
      where: { id },
    });

    await this.redisService.delete(`restaurant:${id}`);
    await this.redisService.delete('restaurants:all');
  }
}
