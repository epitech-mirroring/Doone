import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma';
import {
  FullTeam,
  IdOf,
  ListTeam,
  Organization,
  Team,
  User,
} from '../../types';
import { PermissionsService } from '../permissions/permissions.service';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class TeamsService implements OnModuleInit {
  @Inject(PrismaService)
  private _prismaService: PrismaService;

  @Inject()
  private _permissionsService: PermissionsService;

  @Inject(forwardRef(() => UsersService))
  private _usersService: UsersService;

  @Inject(forwardRef(() => OrganizationsService))
  private _organizationsService: OrganizationsService;

  async onModuleInit(): Promise<void> {
    const globalUserPolicy =
      await this._permissionsService.createPolicy('User');

    await this._permissionsService.addRuleToPolicy<Team>(
      globalUserPolicy,
      'read',
      Team,
      (user, team) =>
        user.teams.some((userTeam) => userTeam.team.id === team?.id),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Team>(
      globalUserPolicy,
      'list',
      Team,
      //TODO: Add a rule to allow users to list teams they are invited to
      (user, team) =>
        user.teams.some((userTeam) => userTeam.team.id === team?.id),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Team>(
      globalUserPolicy,
      'update',
      Team,
      (user, team) =>
        user.teams.some(
          (userTeam) =>
            userTeam.team.id === team?.id && userTeam.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Team>(
      globalUserPolicy,
      'delete',
      Team,
      (user, team) =>
        user.teams.some(
          (userTeam) =>
            userTeam.team.id === team?.id && userTeam.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Team>(
      globalUserPolicy,
      'inviteUser',
      Team,
      (user, team) =>
        user.teams.some(
          (userTeam) =>
            userTeam.team.id === team?.id && userTeam.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Team>(
      globalUserPolicy,
      'removeUser',
      Team,
      (user, team, ctx) =>
        ctx.targetUser.id !== user.id &&
        user.teams.some(
          (userTeam) =>
            userTeam.team.id === team?.id && userTeam.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Team>(
      globalUserPolicy,
      'transferOwnership',
      Team,
      (user, team) => team?.owner.id === user.id,
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Team>(
      globalUserPolicy,
      'leave',
      Team,
      (user, team) =>
        user.id !== team?.owner.id &&
        user.teams.some(
          (userTeam) =>
            userTeam.team.id === team?.id && userTeam.role === 'MEMBER',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Team>(
      globalUserPolicy,
      'addProject',
      Team,
      (user, team) =>
        user.teams.some(
          (userTeam) =>
            userTeam.team.id === team?.id && userTeam.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Team>(
      globalUserPolicy,
      'promoteUser',
      Team,
      (user, team) =>
        user.teams.some(
          (userTeam) =>
            userTeam.team.id === team?.id && userTeam.role === 'ADMIN',
        ),
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Team>(
      globalUserPolicy,
      'demoteUser',
      Team,
      (user, team, ctx) =>
        ctx.targetUser.id !== team?.owner.id &&
        user.teams.some(
          (userTeam) =>
            userTeam.team.id === team?.id && userTeam.role === 'ADMIN',
        ),
      'allow',
    );

    const globalAdminPolicy =
      await this._permissionsService.createPolicy(`Admin`);

    await this._permissionsService.addRuleToPolicy<Team>(
      globalAdminPolicy,
      'delete',
      Team,
      () => true,
      'allow',
    );

    await this._permissionsService.addRuleToPolicy<Team>(
      globalAdminPolicy,
      'list',
      Team,
      () => true,
      'allow',
    );
  }

  async getTeamById(
    id: IdOf<Team>,
    performer: Omit<User, 'actions'>,
  ): Promise<FullTeam | ListTeam | null> {
    const fullTeam = await this.getFullTeamById(id, performer);
    if (!fullTeam) {
      return this.getListsTeamById(id, performer);
    }
    return fullTeam;
  }

  async getFullTeamById(
    id: string,
    performer: Omit<User, 'actions'>,
  ): Promise<FullTeam | null> {
    if (
      !(await this._permissionsService.canUserPerformAction<Team>(
        performer,
        'read',
        id,
        Team,
      ))
    ) {
      return null;
    }

    const team = await this._prismaService.team.findUnique({
      where: { id },
      include: {
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
        organization: {
          select: {
            id: true,
          },
        },
      },
    });

    if (team === null) {
      return null;
    }
    const result: FullTeam = {
      id: team.id,
      name: team.name,
      organization: null,
      users: [],
      owner: null,
    };

    result.owner = await this._usersService.getListsUserById(
      team.owner.id,
      performer,
    );

    result.users = await Promise.all(
      team.users.map(async ({ user }) =>
        this._usersService.getListsUserById(user.id, performer),
      ),
    );

    result.organization =
      await this._organizationsService.getListsOrganizationById(
        team.organization.id,
        performer,
      );

    return result;
  }

  async getListsTeamById(
    id: string,
    performer: Omit<User, 'actions'>,
  ): Promise<ListTeam | null> {
    if (
      !(await this._permissionsService.canUserPerformAction<Team>(
        performer,
        'list',
        id,
        Team,
      ))
    ) {
      return null;
    }

    const team: ListTeam | null = (await this._prismaService.team.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    })) as ListTeam | null;

    if (!team) {
      return null;
    }

    return team;
  }

  async getTeamsForUser(
    userId: IdOf<User>,
    performer: Omit<User, 'actions'>,
  ): Promise<(FullTeam | ListTeam | null)[]> {
    const teamIds = await this._prismaService.team.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return Promise.all(
      teamIds.map(async ({ id }) => {
        if (
          await this._permissionsService.canUserPerformAction<User>(
            performer,
            'read',
            id,
            Team,
          )
        ) {
          return this.getFullTeamById(id, performer);
        } else {
          return this.getListsTeamById(id, performer);
        }
      }),
    );
  }

  async createTeam(
    organizationId: IdOf<Organization>,
    name: string,
    user: Omit<User, 'actions'>,
  ): Promise<Omit<Team, 'actions'> | null> {
    if (
      !(await this._permissionsService.canUserPerformAction<Organization>(
        user,
        'addTeam',
        organizationId,
        Organization,
      ))
    ) {
      return null;
    }

    return this._prismaService.team.create({
      data: {
        name,
        organization: {
          connect: {
            id: organizationId,
          },
        },
        users: {
          create: {
            role: 'ADMIN',
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        },
        owner: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        organization: {
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
