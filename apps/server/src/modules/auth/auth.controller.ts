import {
  Body,
  Controller,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from '../../dtos/auth/auth.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private _authService: AuthService;

  @Public()
  @Post('login')
  async login(
    @Body() body: AuthDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const logged = await this._authService.login(body.email, body.password);

    if (!logged) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const accessToken = await this._authService.generateAccessToken(logged);
    const refreshToken = await this._authService.generateRefreshToken(logged);
    return { accessToken, refreshToken };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Body() body: { refreshToken: string },
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const accessToken = await this._authService.refreshAccessToken(
      body.refreshToken,
    );

    if (!accessToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshToken = await this._authService.updateRefreshToken(
      body.refreshToken,
    );
    return { accessToken, refreshToken };
  }
}
