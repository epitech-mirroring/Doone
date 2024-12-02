import { IdOf, PrismaTableName, Resource, Team, User } from '../index';
import { Role } from '@prisma/client';

export class Organization extends Resource {
  static resourceName: PrismaTableName = 'Organization';
  name: string;
  teams: {
    id: IdOf<Team>;
    name: string;
  }[];
  users: {
    id: IdOf<User>;
    role: Role;
  }[];
  owner: {
    id: IdOf<User>;
  };
  id: string;
  actions:
    | 'read'
    | 'update'
    | 'delete'
    | 'addTeam'
    | 'inviteUser'
    | 'removeUser'
    | 'transferOwnership'
    | 'leave'
    | 'list'
    | 'promoteUser'
    | 'demoteUser';
}
