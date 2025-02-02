import { Address } from './address.entity';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { UserMetadata } from '../../application/commands/create-user/create-user.command';

export { UserRole as PrismaUserRole } from '@prisma/client';

export interface UserData {
  id: string;
  email: string;
  password: string;
  roles: PrismaUserRole[];
  status: 'active' | 'inactive';
  metadata?: UserMetadata;
  addresses?: Address[];
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserStatus = 'active' | 'inactive';

export class User implements UserData {
  id: string;
  email: string;
  password: string;
  roles: PrismaUserRole[];
  status: UserStatus;
  metadata?: UserMetadata;
  addresses?: Address[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<{
    id: string;
    email: string;
    password: string;
    roles: PrismaUserRole[];
    status: string;
    metadata?: UserMetadata;
    addresses?: Address[];
    lastLogin?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>) {
    this.id = data.id!;
    this.email = data.email!;
    this.password = data.password!;
    this.roles = data.roles || [];
    this.status = (data.status || 'active') as UserStatus;
    this.metadata = data.metadata;
    this.addresses = data.addresses || [];
    this.lastLogin = data.lastLogin || undefined;
    this.createdAt = data.createdAt!;
    this.updatedAt = data.updatedAt!;
  }

  toJSON(): UserData {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      roles: this.roles,
      status: this.status,
      metadata: this.metadata,
      addresses: this.addresses,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  hasRole(role: PrismaUserRole): boolean {
    return this.roles.includes(role);
  }
}
