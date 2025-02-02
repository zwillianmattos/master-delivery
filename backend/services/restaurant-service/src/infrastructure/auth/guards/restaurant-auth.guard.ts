import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    roles: string[];
  };
}

@Injectable()
export class RestaurantAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const tokenData = await this.authService.validateToken(token);

      // Attach user data to request
      request.user = {
        id: tokenData.userId,
        roles: tokenData.roles,
      };

      // Check required roles if specified
      const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );
      if (requiredRoles) {
        const hasValidRole = requiredRoles.some((role: string) => {
          return tokenData.roles.includes(role);
        });

        if (!hasValidRole) {
          throw new UnauthorizedException('Insufficient permissions');
        }
      }

      return true;
    } catch (error: unknown) {
      console.error('Authentication failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
