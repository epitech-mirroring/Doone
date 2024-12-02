import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_DECORATOR_KEY } from '../decorators/public.decorator';
import { TokenPayload, TokenType } from '../../../types';

@Injectable({ scope: Scope.REQUEST })
export class AuthGuard implements CanActivate {
  @Inject(JwtService)
  private readonly _jwtService: JwtService;

  @Inject(Reflector)
  private readonly _reflector: Reflector;

  @Inject(AuthService)
  private readonly _authService: AuthService;

  private isPublic(context: ExecutionContext): boolean {
    return this._reflector.getAllAndOverride(IS_PUBLIC_DECORATOR_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private async getTokenPayload(
    token: string,
  ): Promise<TokenPayload | undefined> {
    try {
      const payload: TokenPayload = await this._jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });

      if (!this._authService.isValidTokenPayload(payload)) {
        return undefined;
      }
      return payload.type === TokenType.ACCESS ? payload : undefined;
    } catch {
      return undefined;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublic(context)) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this._authService.extractTokenFromRequest(request);
    const payload = token ? await this.getTokenPayload(token) : undefined;

    if (!payload) {
      throw new UnauthorizedException();
    }

    const valid =
      await this._authService.setAuthContextFromTokenPayloadAsync(payload);
    if (!valid) {
      throw new UnauthorizedException();
    }

    return true;
  }
}