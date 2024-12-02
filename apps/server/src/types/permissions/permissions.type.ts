import { Resource, ResourceType, User } from '../index';

export type Effect = 'allow' | 'deny';

export type Condition<T extends Resource> = (
  user: Omit<User, 'actions'>,
  resource: T,
  ctx?: any,
) => boolean;

export interface Rule<T extends Resource> {
  id: string;
  action: T['actions'];
  resourceType: ResourceType;
  condition: Condition<T>;
  effect: Effect;
}

export interface Policy {
  id: string;
  rules: Rule<Resource>[];
}
