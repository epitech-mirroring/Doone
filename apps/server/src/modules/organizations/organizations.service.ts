import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IdOf, Organization, Team, User } from '../../types';
import { PrismaService } from '../../providers/prisma';
import { AuthContext } from '../auth/auth.context';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class OrganizationsService {
  @Inject()
  private _prismaService: PrismaService;

  @Inject()
  private _authContext: AuthContext;

  @Inject()
  private _permissionsService: PermissionsService;

  //TODO: Secure this method
  async getOrganizations(): Promise<Omit<Organization, 'actions'>[]> {
    return this._prismaService.organization.findMany({
      include: {
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

  //TODO: Secure this method
  async getOrganizationById(
    id: string,
  ): Promise<Omit<Organization, 'actions'> | null> {
    return this._prismaService.organization.findUnique({
      where: { id },
      include: {
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
                name: true,
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

  async getOrganizationsForUser(
    userId: IdOf<User>,
  ): Promise<Omit<Organization, 'actions'>[]> {
    if (!this._authContext.authenticated)
      throw new UnauthorizedException('User not authenticated');

    const organizations = await this._prismaService.organization.findMany({
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
                name: true,
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

    const finalOrganizations: any[] = [];

    for (const organization of organizations) {
      if (
        !(await this._permissionsService.canUserPerformAction<Organization>(
          this._authContext.user,
          'read',
          organization.id,
          Organization,
        ))
      ) {
        if (
          await this._permissionsService.canUserPerformAction<Organization>(
            this._authContext.user,
            'list',
            organization.id,
            Organization,
          )
        ) {
          finalOrganizations.push({
            id: organization.id,
            name: organization.name,
          });
        }
      } else {
        const finalTeams: any[] = [];
        const finalUsers: any[] = [];

        for (const team of organization.teams) {
          if (
            await this._permissionsService.canUserPerformAction<Team>(
              this._authContext.user,
              'list',
              team.id,
              Team,
            )
          ) {
            finalTeams.push({
              id: team.id,
              name: team.name,
            });
          }
        }

        for (const user of organization.users) {
          if (
            await this._permissionsService.canUserPerformAction<User>(
              this._authContext.user,
              'list',
              user.user.id,
              User,
            )
          ) {
            finalUsers.push({
              id: user.user.id,
              name: user.user.name,
              role: user.role,
            });
          } else {
            finalUsers.push({
              id: 0,
              name: 'Anonymous',
              role: user.role,
            });
          }
        }

        finalOrganizations.push({
          ...organization,
          teams: finalTeams,
          users: finalUsers,
        });
      }
    }

    return finalOrganizations;
  }

  async createOrganization(
    name: string,
  ): Promise<Omit<Organization, 'actions'>> {
    if (!this._authContext.authenticated)
      throw new Error('User not authenticated');

    const user = this._authContext.user;

    return this._prismaService.organization.create({
      data: {
        name,
        teams: {
          create: [
            {
              name: 'Default',
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
          ],
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
