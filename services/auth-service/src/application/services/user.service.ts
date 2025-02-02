import { Injectable, ConflictException } from '@nestjs/common';
import { User, PrismaUserRole, UserData } from '../../domain/entities/user.entity';
import { KafkaService } from '../../infrastructure/messaging/kafka/kafka.service';
import { RedisService } from '../../infrastructure/cache/redis/redis.service';
import {
  UserEventTypes,
  UserEventPayload,
  UserRolesChangedPayload,
  UserStatusChangedPayload,
} from '../../domain/events/user.events';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { UserMetadata } from '../commands/create-user/create-user.command';
import { Address } from '../../domain/entities/address.entity';

type PrismaAddress = {
  id: string;
  street: string;
  number: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaUser = {
  id: string;
  email: string;
  password: string;
  roles: PrismaUserRole[];
  status: string;
  metadata: Prisma.JsonValue;
  addresses: PrismaAddress[];
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UserService {
  private readonly USER_CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaService: KafkaService,
    private readonly redisService: RedisService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      // Try to get from cache first
      const cachedUser = await this.redisService.get<User>(`user:email:${email}`);
      if (cachedUser) {
        return new User(cachedUser);
      }

      // If not in cache, get from database
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { addresses: true }
      }) as unknown as PrismaUser;
      if (!user) return null;

      // Cache the user data
      await this.cacheUserData({
        id: user.id,
        email: user.email,
        roles: user.roles,
        status: user.status as 'active' | 'inactive',
        metadata: user.metadata as UserMetadata | undefined
      });

      return this.convertPrismaUser(user);
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async create(data: { 
    email: string; 
    password: string; 
    roles?: PrismaUserRole[];
    metadata?: UserMetadata;
  }): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const createData: Prisma.UserCreateInput = {
        email: data.email,
        password: hashedPassword,
        roles: data.roles || [PrismaUserRole.CUSTOMER],
        status: 'active',
      };

      if (data.metadata) {
        (createData as any).metadata = data.metadata;
      }

      const user = await this.prisma.user.create({
        data: createData,
        include: { addresses: true }
      }) as unknown as PrismaUser;

      const newUser = this.convertPrismaUser(user);

      // Cache user data
      await this.cacheUserData({
        id: newUser.id,
        email: newUser.email,
        roles: newUser.roles,
        status: newUser.status,
        metadata: data.metadata,
      });

      // Emit user created event
      await this.emitUserEvent(UserEventTypes.CREATED, newUser);

      return newUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    // Try to get from cache first
    const cachedUser = await this.redisService.get<User>(`user:${id}`);
    if (cachedUser) {
      return new User(cachedUser);
    }

    // If not in cache, get from database
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { addresses: true }
    }) as unknown as PrismaUser;
    if (!user) return null;

    // Cache the user data
    await this.cacheUserData({
      id: user.id,
      email: user.email,
      roles: user.roles,
      status: user.status as 'active' | 'inactive',
      metadata: user.metadata as UserMetadata | undefined
    });

    return this.convertPrismaUser(user);
  }

  async updateRoles(userId: string, newRoles: PrismaUserRole[]): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true }
    }) as unknown as PrismaUser;
    if (!user) throw new Error('User not found');

    const previousRoles = user.roles as PrismaUserRole[];

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { roles: newRoles },
      include: { addresses: true }
    }) as unknown as PrismaUser;

    const userEntity = this.convertPrismaUser(updatedUser);

    // Cache updated user data
    await this.cacheUserData({
      id: userEntity.id,
      email: userEntity.email,
      roles: userEntity.roles,
      status: userEntity.status,
      metadata: userEntity.metadata
    });

    // Emit role changed event
    const roleChangedPayload: UserRolesChangedPayload = {
      ...this.createBaseEventPayload(userEntity),
      previousRoles,
      newRoles,
    };

    await this.kafkaService.emitUserEvent(UserEventTypes.ROLE_CHANGED, roleChangedPayload);

    return userEntity;
  }

  async updateStatus(userId: string, newStatus: 'active' | 'inactive'): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true }
    }) as unknown as PrismaUser;
    if (!user) throw new Error('User not found');

    const previousStatus = user.status;
    const updatedUserData = await this.prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
      include: { addresses: true }
    }) as unknown as PrismaUser;

    const updatedUser = this.convertPrismaUser(updatedUserData);

    // Cache updated user data
    await this.cacheUserData({
      id: updatedUser.id,
      email: updatedUser.email,
      roles: updatedUser.roles,
      status: updatedUser.status,
      metadata: updatedUser.metadata
    });

    // Emit status changed event
    const statusChangedPayload: UserStatusChangedPayload = {
      ...this.createBaseEventPayload(updatedUser),
      previousStatus: previousStatus as 'active' | 'inactive',
      newStatus,
    };

    await this.kafkaService.emitUserEvent(UserEventTypes.STATUS_CHANGED, statusChangedPayload);

    return updatedUser;
  }

  async update(userId: string, data: Partial<{
    email?: string;
    roles?: PrismaUserRole[];
    status?: 'active' | 'inactive';
    metadata?: UserMetadata;
  }>): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true }
    }) as unknown as PrismaUser;
    if (!user) throw new Error('User not found');

    const updateData: Prisma.UserUpdateInput = {};
    
    if (data.email) updateData.email = data.email;
    if (data.roles) updateData.roles = data.roles;
    if (data.status) updateData.status = data.status;
    if (data.metadata) {
      (updateData as any).metadata = data.metadata;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { addresses: true }
    }) as unknown as PrismaUser;

    const userEntity = this.convertPrismaUser(updatedUser);

    // Cache updated user data
    await this.cacheUserData({
      id: userEntity.id,
      email: userEntity.email,
      roles: userEntity.roles,
      status: userEntity.status,
      metadata: userEntity.metadata
    });

    // Emit user updated event
    await this.emitUserEvent(UserEventTypes.UPDATED, userEntity);

    return userEntity;
  }

  private convertPrismaUser(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      roles: prismaUser.roles,
      status: prismaUser.status,
      metadata: prismaUser.metadata as UserMetadata | undefined,
      addresses: prismaUser.addresses.map(addr => new Address(addr)),
      lastLogin: prismaUser.lastLogin,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  private async cacheUserData(data: Pick<UserData, 'id' | 'email' | 'roles' | 'status' | 'metadata'>): Promise<void> {
    await this.redisService.set(`user:${data.id}`, data, this.USER_CACHE_TTL);
  }

  private async emitUserEvent(eventType: UserEventTypes, user: User): Promise<void> {
    const payload = this.createBaseEventPayload(user);
    await this.kafkaService.emitUserEvent(eventType, payload);
  }

  private createBaseEventPayload(user: User): UserEventPayload {
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      status: user.status,
      eventType: UserEventTypes.UPDATED,
      timestamp: new Date(),
      password: user.password,
    };
  }
}
