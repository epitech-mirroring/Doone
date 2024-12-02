import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { TokenPayload, TokenType, User } from '../../types';
import { AuthContext } from './auth.context';
import { Request } from 'express';

@Injectable()
export class AuthService {
  @Inject(JwtService)
  private readonly _jwtService: JwtService;

  @Inject(UsersService)
  private readonly _usersService: UsersService;

  @Inject(AuthContext)
  private readonly _authContext: AuthContext;

  private readonly algorithm = 'aes-256-cbc';
  private readonly key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  private readonly iv = Buffer.from(process.env.ENCRYPTION_IV!, 'hex');

  private encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  public async login(
    email: string,
    password: string,
  ): Promise<Omit<User, 'actions'> | null> {
    const found = await this._usersService.getUserByEmail(email);

    if (!found) {
      return null;
    }

    if (await bcrypt.compare(password, found.password)) {
      this._authContext.user = found;
      return found;
    }
    return null;
  }

  public hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  public isValidTokenPayload(payload: TokenPayload): boolean {
    const example: TokenPayload = {
      sub: '',
      type: TokenType.ACCESS,
    };
    for (const key in example) {
      if (payload[key] === undefined) {
        return false;
      }
    }
    return true;
  }

  public extractTokenFromRequest(request: Request): string | null {
    const header = request.headers.authorization;

    if (!header) {
      return null;
    }

    const [type, token] = header.split(' ');

    if (type !== 'Bearer') {
      return null;
    }

    return token;
  }

  public async setAuthContextFromTokenPayloadAsync(
    payload: TokenPayload,
  ): Promise<boolean> {
    const user = await this._usersService.getUserById(payload.sub);

    if (!user) {
      return false;
    }

    this._authContext.user = user;
    return true;
  }

  public async generateAccessToken(
    user: Omit<User, 'actions'>,
  ): Promise<string> {
    const payload: TokenPayload = {
      sub: user.id,
      type: TokenType.ACCESS,
    };

    return this._jwtService.sign(payload);
  }

  public async generateRefreshToken(
    user: Omit<User, 'actions'>,
  ): Promise<string> {
    const payload: TokenPayload = {
      sub: user.id,
      type: TokenType.REFRESH,
    };

    return this._jwtService.sign(payload, {
      expiresIn: '30d',
    });
  }

  public async refreshAccessToken(
    refreshToken: string,
  ): Promise<string | null> {
    const payload = await this._jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_SECRET,
    });

    if (
      !this.isValidTokenPayload(payload) ||
      payload.type !== TokenType.REFRESH
    ) {
      return null;
    }

    const user = await this._usersService.getUserById(payload.sub);

    if (!user) {
      return null;
    }

    return this.generateAccessToken(user);
  }

  public async updateRefreshToken(
    refreshToken: string,
  ): Promise<string | undefined> {
    const payload = await this._jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_SECRET,
    });

    if (
      !this.isValidTokenPayload(payload) ||
      payload.type !== TokenType.REFRESH
    ) {
      return undefined;
    }

    const user = await this._usersService.getUserById(payload.sub);

    if (!user) {
      return undefined;
    }

    // If the token is going to expire in less than 7 days, generate a new one
    const now = Date.now() / 1000;
    if (payload.exp - now > 60 * 60 * 24 * 7) {
      return undefined;
    }

    return this.generateRefreshToken(user);
  }

  public generateVerificationCode(): number {
    return Math.floor(10_000_000 + Math.random() * 99_999_999);
  }
}
