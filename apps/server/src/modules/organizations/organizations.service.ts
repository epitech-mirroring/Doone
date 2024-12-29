import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  FullOrganization,
  IdOf,
  ListOrganization,
  Organization,
  User,
} from '../../types';
import { PrismaService } from '../../providers/prisma';
import { PermissionsService } from '../permissions/permissions.service';
import { TeamsService } from '../teams/teams.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrganizationsService implements OnModuleInit {
  @Inject()
  private _prismaService: PrismaService;

  @Inject()
  private _permissionsService: PermissionsService;

  @Inject(forwardRef(() => TeamsService))
  private _teamsService: TeamsService;

  @Inject(forwardRef(() => UsersService))
  private _usersService: UsersService;

  async onModuleInit(): Promise<void> {
    const globalUserPolicy =
      await this._permissionsService.createPolicy('User');

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'read',
      Organization,
      (user, organization) =>
        user.organizations.some(
          (userOrganization) =>
            userOrganization.organization.id === organization?.id,
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'list',
      Organization,
      // TODO: Add a rule to allow users to list organizations they are invited to
      (user, organization) =>
        user.organizations.some(
          (userOrganization) =>
            userOrganization.organization.id === organization?.id,
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'update',
      Organization,
      (user, organization) =>
        user.organizations.some(
          (userOrganization) =>
            userOrganization.organization.id === organization?.id &&
            userOrganization.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'delete',
      Organization,
      (user, organization) => organization?.owner.id === user.id,
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'addTeam',
      Organization,
      (user, organization) =>
        user.organizations.some(
          (userOrganization) =>
            userOrganization.organization.id === organization?.id &&
            userOrganization.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'inviteUser',
      Organization,
      (user, organization) =>
        user.organizations.some(
          (userOrganization) =>
            userOrganization.organization.id === organization?.id &&
            userOrganization.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'removeUser',
      Organization,
      (user, organization, ctx) =>
        ctx.targetUser.id !== user.id &&
        user.organizations.some(
          (userOrganization) =>
            userOrganization.organization.id === organization?.id &&
            userOrganization.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'transferOwnership',
      Organization,
      (user, organization) => organization?.owner.id === user.id,
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'leave',
      Organization,
      (user, organization) =>
        user.id !== organization?.owner.id &&
        user.organizations.some(
          (userOrganization) =>
            userOrganization.organization.id === organization?.id &&
            userOrganization.role === 'MEMBER',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'promoteUser',
      Organization,
      (user, organization) =>
        user.organizations.some(
          (userOrganization) =>
            userOrganization.organization.id === organization?.id &&
            userOrganization.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'demoteUser',
      Organization,
      (user, organization, ctx) =>
        ctx.targetUser.id !== organization?.owner.id &&
        user.organizations.some(
          (userOrganization) =>
            userOrganization.organization.id === organization?.id &&
            userOrganization.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalUserPolicy,
      'create',
      Organization,
      (user) => user.organizations.length < 5,
      'allow',
    );

    const globalAdminPolicy =
      await this._permissionsService.createPolicy(`Admin`);

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalAdminPolicy,
      'delete',
      Organization,
      () => true,
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Organization>(
      globalAdminPolicy,
      'list',
      Organization,
      () => true,
      'allow',
    );
  }

  async getFullOrganizationById(
    id: IdOf<Organization>,
    performer: Omit<User, 'actions'>,
  ): Promise<FullOrganization | null> {
    if (
      !(await this._permissionsService.canUserPerformAction<Organization>(
        performer,
        'read',
        id,
        Organization,
      ))
    ) {
      return null;
    }

    const organization = await this._prismaService.organization.findUnique({
      where: { id },
      include: {
        teams: {
          select: {
            id: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!organization) {
      return null;
    }

    const result: FullOrganization = {
      id: organization.id,
      name: organization.name,
      teams: [],
      users: [],
      owner: null,
    };

    result.owner = await this._usersService.getListsUserById(
      organization.owner.id,
      performer,
    );

    result.teams = await Promise.all(
      organization.teams.map(async ({ id }) =>
        this._teamsService.getFullTeamById(id, performer),
      ),
    );

    result.users = await Promise.all(
      organization.users.map(async ({ user }) =>
        this._usersService.getListsUserById(user.id, performer),
      ),
    );

    return result;
  }

  async getListsOrganizationById(
    id: IdOf<Organization>,
    performer: Omit<User, 'actions'>,
  ): Promise<ListOrganization | null> {
    if (
      !(await this._permissionsService.canUserPerformAction<Organization>(
        performer,
        'list',
        id,
        Organization,
      ))
    ) {
      return null;
    }

    return this._prismaService.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getOrganizationById(
    id: IdOf<Organization>,
    performer: Omit<User, 'actions'>,
  ): Promise<FullOrganization | ListOrganization | null> {
    const fullOrganization = await this.getFullOrganizationById(id, performer);
    if (!fullOrganization) {
      return this.getListsOrganizationById(id, performer);
    }
    return fullOrganization;
  }

  async getOrganizationsForUser(
    userId: IdOf<User>,
    user: Omit<User, 'actions'>,
  ): Promise<(FullOrganization | ListOrganization | null)[]> {
    const organizationIds = await this._prismaService.organization.findMany({
      where: { users: { some: { userId } } },
      select: {
        id: true,
      },
    });

    return Promise.all(
      organizationIds.map(({ id }) => this.getOrganizationById(id, user)),
    );
  }

  async createOrganization(
    options: Pick<Omit<Organization, 'actions'>, 'name'>,
    owner: Omit<User, 'actions'>,
    performer: Omit<User, 'actions'>,
  ): Promise<Omit<Organization, 'actions'> | null> {
    if (
      !(await this._permissionsService.canUserPerformAction<Organization>(
        performer,
        'create',
        null,
        Organization,
      ))
    ) {
      return null;
    }

    return this._prismaService.organization.create({
      data: {
        name: options.name,
        teams: {
          create: [
            {
              name: 'Default',
              users: {
                create: {
                  role: 'ADMIN',
                  user: {
                    connect: {
                      id: owner.id,
                    },
                  },
                },
              },
              owner: {
                connect: {
                  id: owner.id,
                },
              },
            },
          ],
        },
        users: {
          create: {
            role: 'ADMIN',
            user: {
              connect: {
                id: owner.id,
              },
            },
          },
        },
        owner: {
          connect: {
            id: owner.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        teams: {
          select: {
            id: true,
            name: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
          },
        },
      },
    });
  }
}
