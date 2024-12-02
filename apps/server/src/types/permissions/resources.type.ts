import { Prisma } from '@prisma/client';

export type PrismaTableName = keyof Prisma.TypeMap['model'];

export abstract class Resource {
  id: string;
  actions: string;

  static resourceName: PrismaTableName;
}

export type ResourceType = typeof Resource & { resourceName: string };
