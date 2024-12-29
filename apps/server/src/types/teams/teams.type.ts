import {
  IdOf,
  ListOrganization,
  ListUser,
  Organization,
  PrismaTableName,
  Resource,
  User,
} from '../index';
import { Role } from '@prisma/client';

export class Team extends Resource {
  static resourceName: PrismaTableName = 'Team';

  id: string;
  name: string;
  organization: {
    id: IdOf<Organization>;
    name: string;
  };
  users: {
    user: {
      id: IdOf<User>;
    };
    role: Role;
  }[];
  owner: {
    id: IdOf<User>;
  };
  actions:
    | 'read'
    | 'update'
    | 'delete'
    | 'inviteUser'
    | 'removeUser'
    | 'transferOwnership'
    | 'leave'
    | 'addProject'
    | 'list'
    | 'promoteUser'
    | 'demoteUser';
}

export type FullTeam = {
  id: string;
  name: string;
  organization: ListOrganization | null;
  users: (ListUser | null)[];
  owner: ListUser | null;
};

export type ListTeam = {
  id: string;
  name: string;
};
