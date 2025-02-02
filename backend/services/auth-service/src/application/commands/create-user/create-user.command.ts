import { UserRole as PrismaUserRole } from '@prisma/client';

export interface UserMetadata {
  name?: string;
  phoneNumber?: string;
  cnpj?: string;
  cpf?: string;
  businessHours?: string;
  vehiclePlate?: string;
  department?: string;
}

export class CreateUserCommand {    
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly roles: PrismaUserRole[] = [PrismaUserRole.CUSTOMER],
    public readonly metadata?: UserMetadata,
  ) {}
}

export interface CreateUserCommandResult {
  id: string;
  email: string;
  roles: PrismaUserRole[];
  status: 'active' | 'inactive';
  metadata?: UserMetadata;
}
