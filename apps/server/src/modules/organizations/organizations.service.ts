import { Inject, Injectable } from '@nestjs/common';
import { IdOf, Organization, User } from '../../types';
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
  async getOrganizationsForUser(
    userId: IdOf<User>,
  ): Promise<Omit<Organization, 'actions'>[]> {
    return this._prismaService.organization.findMany({
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
          where: {
            users: {
              some: {
                id: userId,
              },
            },
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
