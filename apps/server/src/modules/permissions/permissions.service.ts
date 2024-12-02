import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma';
import {
  Condition,
  Effect,
  IdOf,
  Policy,
  Resource,
  ResourceType,
  Rule,
  User,
} from '../../types';
import { Effect as PrismaEffect } from '@prisma/client';
import { ResourcesService } from './resources.service';

@Injectable()
export class PermissionsService {
  constructor(
    @Inject() private _prismaService: PrismaService,
    @Inject() private _resourcesService: ResourcesService,
  ) {
    this._prismaService = _prismaService;
    this._resourcesService = _resourcesService;
  }

  private prismaEffectToEffect(effect: PrismaEffect): Effect {
    return effect === 'ALLOW' ? 'allow' : 'deny';
  }

  private effectToPrismaEffect(effect: Effect): PrismaEffect {
    return effect === 'allow' ? 'ALLOW' : 'DENY';
  }

  // ABAC

  async canUserPerformAction<T extends Resource>(
    user: Omit<User, 'actions'>,
    action: T['actions'],
    resourceId: IdOf<T>,
    resourceType: ResourceType,
    ctx?: any,
  ): Promise<boolean> {
    const policies = await this._prismaService.policy.findMany({
      where: {
        users: {
          some: {
            id: user.id,
          },
        },
        rules: {
          some: {
            action: action.toString(),
            resourceType: resourceType.resourceName,
          },
        },
      },
      include: {
        rules: true,
      },
    });

    const policiesWithRules = policies.map((policy) => ({
      id: policy.id,
      rules: policy.rules.map((rule) => ({
        id: rule.id,
        action: rule.action,
        resourceType: rule.resourceType,
        condition: new Function(
          'user',
          'resource',
          rule.condition,
        ) as Condition<any>,
        effect: this.prismaEffectToEffect(rule.effect),
      })),
    }));

    const resource = await this._resourcesService.getResource(
      resourceId,
      resourceType,
    );

    if (resource === null) return false;

    for (const policy of policiesWithRules) {
      for (const rule of policy.rules) {
        if (rule.action === action.toString()) {
          if (rule.condition(user, resource, ctx)) {
            return rule.effect === 'allow';
          }
        }
      }
    }

    return false;
  }

  async createPolicy(name: string): Promise<IdOf<Policy>> {
    return (
      await this._prismaService.policy.create({
        data: {
          id: name,
        },
        select: {
          id: true,
        },
      })
    ).id;
  }

  async addRuleToPolicy<T extends Resource>(
    policyId: IdOf<Policy>,
    action: T['actions'],
    resourceType: ResourceType,
    condition: Condition<T>,
    effect: Effect,
  ): Promise<IdOf<Rule<T>>> {
    const actionString = action.toString();
    return (
      await this._prismaService.rule.create({
        data: {
          resourceType: resourceType.resourceName,
          action: actionString,
          condition: condition.toString(),
          effect: this.effectToPrismaEffect(effect),
          policy: {
            connect: {
              id: policyId,
            },
          },
        },
        select: {
          id: true,
        },
      })
    ).id;
  }

  async addPolicyToUser(
    userId: IdOf<User>,
    policyId: IdOf<Policy>,
  ): Promise<void> {
    await this._prismaService.user.update({
      where: { id: userId },
      data: {
        policies: {
          connect: {
            id: policyId,
          },
        },
      },
    });
  }

  async removePolicyFromUser(
    userId: IdOf<User>,
    policyId: IdOf<Policy>,
  ): Promise<void> {
    await this._prismaService.user.update({
      where: { id: userId },
      data: {
        policies: {
          disconnect: {
            id: policyId,
          },
        },
      },
    });
  }

  async removeRuleFromPolicy(ruleId: IdOf<Rule<Resource>>): Promise<void> {
    await this._prismaService.rule.delete({
      where: { id: ruleId },
    });
  }
}
