import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface ValidateTokenResponse {
  valid: boolean;
  userId: string;
  roles: string[];
}

interface UserRolesResponse {
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get authServiceUrl() {
    return this.configService.get<string>('AUTH_SERVICE_URL');
  }

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<ValidateTokenResponse>(
          `${this.authServiceUrl}/auth/validate`,
          {
            token,
          },
        ),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Token validation failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateUserRole(
    userId: string,
    requiredRole: string,
  ): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<UserRolesResponse>(
          `${this.authServiceUrl}/users/${userId}/roles`,
        ),
      );
      return response.data.roles.includes(requiredRole);
    } catch (error: unknown) {
      console.error('Role validation failed:', error);
      throw new UnauthorizedException('Invalid user role');
    }
  }
}
