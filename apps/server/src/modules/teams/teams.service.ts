import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma';
import { IdOf, Organization, Team, User } from '../../types';
import { AuthContext } from '../auth/auth.context';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class TeamsService {
  @Inject(PrismaService)
  private _prismaService: PrismaService;

  @Inject()
  private readonly _authContext: AuthContext;

  @Inject()
  private _permissionsService: PermissionsService;

  //TODO: Secure this method
  async getTeamsForOrganization(
    organizationId: IdOf<Organization>,
  ): Promise<Omit<Team, 'actions'>[]> {
    return this._prismaService.team.findMany({
      where: {
        organization: {
          id: organizationId,
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
          select: {
            role: true,
          },
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

  //TODO: Secure this method
  async getTeamById(id: string): Promise<Omit<Team, 'actions'> | null> {
    return this._prismaService.team.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        users: {
          select: {
            role: true,
          },
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

  //TODO: Secure this method
  async getTeamForUser(userId: IdOf<User>): Promise<Omit<Team, 'actions'>[]> {
    return this._prismaService.team.findMany({
      where: {
        users: {
          some: {
            user: {
              id: userId,
            },
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
          select: {
            role: true,
          },
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

  async createTeam(
    organizationId: IdOf<Organization>,
    name: string,
  ): Promise<Omit<Team, 'actions'> | null> {
    if (!this._authContext.authenticated) {
      return null;
    }

    if (
      !(await this._permissionsService.canUserPerformAction<Organization>(
        this._authContext.user,
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
                id: this._authContext.user.id,
              },
            },
          },
        },
        owner: {
          connect: {
            id: this._authContext.user.id,
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
          select: {
            role: true,
          },
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
