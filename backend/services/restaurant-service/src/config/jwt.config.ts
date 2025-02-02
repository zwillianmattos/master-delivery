import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessToken: {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
  },
  refreshToken: {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
}));
