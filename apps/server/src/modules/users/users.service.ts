import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma';
import { FullUser, IdOf, ListUser, User } from '../../types';
import { AuthService } from '../auth/auth.service';
import { PermissionsService } from '../permissions/permissions.service';
import { MailService } from '../../providers/postmark/mail.service';
import { VerificationEmail } from '../../types/auth/mail.type';
import { TeamsService } from '../teams/teams.service';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class UsersService implements OnModuleInit {
  @Inject(PrismaService)
  private _prismaService: PrismaService;

  @Inject(forwardRef(() => AuthService))
  private _authService: AuthService;

  @Inject(forwardRef(() => TeamsService))
  private _teamsService: TeamsService;

  @Inject(forwardRef(() => OrganizationsService))
  private _organizationsService: OrganizationsService;

  @Inject()
  private _permissionsService: PermissionsService;

  @Inject()
  private _mailService: MailService;

  async onModuleInit(): Promise<void> {
    const globalUserPolicy =
      await this._permissionsService.createPolicy('User');

    await this._permissionsService.addRuleToPolicy<User>(
      globalUserPolicy,
      'read',
      User,
      (user, targetUser) => {
        return user.id === targetUser?.id;
      },
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<User>(
      globalUserPolicy,
      'update',
      User,
      (user, targetUser) => user.id === targetUser?.id,
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<User>(
      globalUserPolicy,
      'delete',
      User,
      (user, targetUser) => user.id === targetUser?.id,
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<User>(
      globalUserPolicy,
      'list',
      User,
      () => true,
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<User>(
      globalUserPolicy,
      'resetPassword',
      User,
      (user, targetUser) => user.id === targetUser?.id,
      'allow',
    );

    const globalAdminPolicy =
      await this._permissionsService.createPolicy(`Admin`);

    await this._permissionsService.addRuleToPolicy<User>(
      globalAdminPolicy,
      'delete',
      User,
      () => true,
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<User>(
      globalAdminPolicy,
      'resetPassword',
      User,
      () => true,
      'allow',
    );
  }

  async getFullUserById(
    id: IdOf<User>,
    performer: Omit<User, 'actions'>,
  ): Promise<FullUser | null> {
    if (
      !(await this._permissionsService.canUserPerformAction<User>(
        performer,
        'read',
        id,
        User,
      ))
    ) {
      return null;
    }

    const user = await this._prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const result: FullUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      organizations: [],
      teams: [],
    };

    result.teams = await this._teamsService.getTeamsForUser(id, performer);
    result.organizations =
      await this._organizationsService.getOrganizationsForUser(id, performer);

    return result;
  }

  async getListsUserById(
    id: IdOf<User>,
    performer: Omit<User, 'actions'>,
  ): Promise<ListUser | null> {
    if (
      !(await this._permissionsService.canUserPerformAction<User>(
        performer,
        'read',
        id,
        User,
      ))
    ) {
      return null;
    }

    return (await this._prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    })) as ListUser | null;
  }

  public async getUserById(
    id: IdOf<User>,
    performer: Omit<User, 'actions'>,
  ): Promise<FullUser | ListUser | null> {
    const fullUser = await this.getFullUserById(id, performer);
    if (!fullUser) {
      return this.getListsUserById(id, performer);
    }
    return fullUser;
  }

  async getUserByEmail(
    email: string,
    user: Omit<User, 'actions'>,
  ): Promise<Omit<User, 'actions'> | null> {
    const userId = await this._prismaService.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!userId) {
      return null;
    }

    if (
      !(await this._permissionsService.canUserPerformAction<User>(
        user,
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

  async sendVerificationEmail(user: Omit<User, 'actions'>): Promise<void> {
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

  async verifyEmail(
    code: number,
    user: Omit<User, 'actions'>,
  ): Promise<boolean> {
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
