import {
  FullTeam,
  IdOf,
  ListTeam,
  ListUser,
  PrismaTableName,
  Resource,
  Team,
  User,
} from '../index';
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
    | 'demoteUser'
    | 'create';
}

export type FullOrganization = {
  id: string;
  name: string;
  teams: (FullTeam | ListTeam | null)[];
  users: (ListUser | null)[];
  owner: ListUser | null;
};

export type ListOrganization = {
  id: string;
  name: string;
};
