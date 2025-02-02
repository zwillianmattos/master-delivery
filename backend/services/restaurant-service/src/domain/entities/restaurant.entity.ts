import { Category, Menu } from '@prisma/client';

export class Restaurant {
  id: string;

  name: string;

  description: string;

  address: string;

  phone: string;

  openingHours: string;

  cuisineType: string;

  rating: number;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;

  userId: string;

  menus: Menu[];

  categories: Category[];
}
