import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../application/services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { User } from '../../../domain/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user as User);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate token' })
  @ApiResponse({ status: 200, description: 'Token validated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async validateToken(@Body('token') token: string) {
    return this.authService.validateToken(token);
  }
} 