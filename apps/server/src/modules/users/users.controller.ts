import {
  Body,
  ConflictException,
  Controller,
  forwardRef,
  Get,
  Inject,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { RegisterDTO, VerifyEmailDTO } from '../../dtos/users/users.dto';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { Private } from '../auth/decorators/private.decorator';
import { AuthContext } from '../auth/auth.context';
import { User } from '../../types';
import { OrganizationsService } from '../organizations/organizations.service';

@Controller('users')
export class UsersController {
  @Inject(UsersService)
  private _usersService: UsersService;

  @Inject(AuthService)
  private _authService: AuthService;

  @Inject(AuthContext)
  private _authContext: AuthContext;

  @Inject(forwardRef(() => OrganizationsService))
  private _organizationsService: OrganizationsService;

  @Public()
  @Post('register')
  async register(@Body() body: RegisterDTO): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const email = body.email;

    if (await this._usersService.doesUserExist(email)) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this._usersService.createUser({ ...body });
    if (!user) {
      throw new InternalServerErrorException('User could not be created');
    }
    const accessToken = await this._authService.generateAccessToken(user);
    const refreshToken = await this._authService.generateRefreshToken(user);
    this._authContext.user = user;

    await this._usersService.sendVerificationEmail();

    return { accessToken, refreshToken };
  }

  @Private()
  @Get('me')
  async me() {
    const user: Partial<User> | null = await this._usersService.getUserById(
      this._authContext.user.id,
    );
    if (!user) {
      throw new InternalServerErrorException('User could not be found');
    }
    delete user.password;
    return user;
  }

  @Private()
  @Post('verify')
  async verify(@Body() body: VerifyEmailDTO): Promise<void> {
    const user = await this._usersService.verifyEmail(body.verificationCode);
    if (!user) {
      throw new InternalServerErrorException('User could not be verified');
    }
    return;
  }
}
