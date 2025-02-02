import { SetMetadata } from '@nestjs/common';
import { PrismaUserRole } from '../../../domain/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PrismaUserRole[]) => SetMetadata(ROLES_KEY, roles); 