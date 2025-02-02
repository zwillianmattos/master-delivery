import { UserRole as PrismaUserRole } from '@prisma/client';

export enum UserEventTypes {
  CREATED = 'user.created',
  UPDATED = 'user.updated',
  DELETED = 'user.deleted',
  ROLE_CHANGED = 'user.role_changed',
  STATUS_CHANGED = 'user.status_changed',
}

export interface UserEventPayload {
  id: string;
  email: string;
  roles: PrismaUserRole[];
  password: string;
  status: 'active' | 'inactive';
  eventType: UserEventTypes;
  timestamp: Date;
}

export interface UserRolesChangedPayload extends UserEventPayload {
  previousRoles: PrismaUserRole[];
  newRoles: PrismaUserRole[];
}

export interface UserStatusChangedPayload extends UserEventPayload {
  previousStatus: 'active' | 'inactive';
  newStatus: 'active' | 'inactive';
}
