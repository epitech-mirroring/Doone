import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma';
import { IdOf, User } from '../../types';
import { AuthService } from '../auth/auth.service';
import { AuthContext } from '../auth/auth.context';
import { PermissionsService } from '../permissions/permissions.service';
import { MailService } from '../../providers/postmark/mail.service';
import { VerificationEmail } from '../../types/auth/mail.type';

@Injectable()
export class UsersService {
  @Inject(PrismaService)
  private _prismaService: PrismaService;

  @Inject(forwardRef(() => AuthService))
  private _authService: AuthService;

  @Inject()
  private _authContext: AuthContext;

  @Inject()
  private _permissionsService: PermissionsService;

  @Inject()
  private _mailService: MailService;

  async getUserById(id: IdOf<User>): Promise<Omit<User, 'actions'> | null> {
    if (!this._authContext.authenticated) {
      return null;
    }

    if (
      !(await this._permissionsService.canUserPerformAction(
        this._authContext.user,
        'read',
        id,
        User,
      ))
    ) {
      return null;
    }

    return this._prismaService.user.findUnique({
      where: { id },
      include: {
        organizations: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserByEmail(email: string): Promise<Omit<User, 'actions'> | null> {
    if (!this._authContext.authenticated) {
      return null;
    }

    const userId = await this._prismaService.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!userId) {
      return null;
    }

    if (
      !(await this._permissionsService.canUserPerformAction(
        this._authContext.user,
        'read',
        userId.id,
        User,
      ))
    ) {
      return null;
    }

    return this._prismaService.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async doesUserExist(email: string): Promise<boolean> {
    return Boolean(
      await this._prismaService.user.findUnique({ where: { email } }),
    );
  }

  async createUser(
    data: Pick<User, 'name' | 'email' | 'password'>,
  ): Promise<Omit<User, 'actions'> | null> {
    return this._prismaService.user.create({
      data: {
        ...data,
        password: this._authService.hashPassword(data.password),
        policies: {
          connect: {
            id: 'User',
          },
        },
      },
      include: {
        organizations: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async sendVerificationEmail(): Promise<void> {
    if (!this._authContext.authenticated) {
      return;
    }

    const user = this._authContext.user;

    const verificationCode = this._authService.generateVerificationCode();

    await this._prismaService.verificationRequest.upsert({
      where: {
        userId: user.id,
      },
      update: {
        code: verificationCode,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
      create: {
        code: verificationCode,
        user: {
          connect: {
            id: user.id,
          },
        },
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    await this._mailService.sendEmailWithTemplate<VerificationEmail>(
      VerificationEmail,
      user.email,
      {
        name: user.name,
        verificationCode,
        recipientMail: user.email,
      },
    );
  }

  async verifyEmail(code: number): Promise<boolean> {
    if (!this._authContext.authenticated) {
      return false;
    }

    const user = this._authContext.user;

    const verificationRequest =
      await this._prismaService.verificationRequest.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (!verificationRequest) {
      return false;
    }

    if (verificationRequest.code !== code) {
      return false;
    }

    if (verificationRequest.expires < new Date()) {
      await this._prismaService.verificationRequest.delete({
        where: {
          userId: user.id,
        },
      });
      return false;
    }

    await this._prismaService.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
      },
    });

    await this._prismaService.verificationRequest.delete({
      where: {
        userId: user.id,
      },
    });

    return true;
  }
}
