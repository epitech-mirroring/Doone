import { PrismaTableName, Resource } from '../index';
import { Role } from '@prisma/client';

export class User extends Resource {
  static resourceName: PrismaTableName = 'User';

  id: string;
  email: string;
  name: string;
  password: string;
  organizations: {
    organization: {
      id: string;
      name: string;
    };
    role: Role;
  }[];
  teams: {
    team: {
      id: string;
      name: string;
    };
    role: Role;
  }[];
  actions: 'read' | 'update' | 'delete' | 'list' | 'resetPassword';
}
