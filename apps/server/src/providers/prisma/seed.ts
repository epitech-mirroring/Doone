import { PermissionsService } from '../../modules/permissions/permissions.service';
import { ResourcesService } from '../../modules/permissions/resources.service';
import { PrismaService } from './prisma.service';
import { Organization, Team, User } from '../../types';

const prisma = new PrismaService();
const resourcesService = new ResourcesService(prisma);
const _permissionsService = new PermissionsService(prisma, resourcesService);

async function main() {
  // Admin
  const globalAdminPolicy = await _permissionsService.createPolicy(`Admin`);

  // Users
  await _permissionsService.addRuleToPolicy<User>(
    globalAdminPolicy,
    'delete',
    User,
    () => true,
    'allow',
  );

  await _permissionsService.addRuleToPolicy<User>(
    globalAdminPolicy,
    'resetPassword',
    User,
    () => true,
    'allow',
  );

  // Organizations
  await _permissionsService.addRuleToPolicy<Organization>(
    globalAdminPolicy,
    'delete',
    Organization,
    () => true,
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Organization>(
    globalAdminPolicy,
    'list',
    Organization,
    () => true,
    'allow',
  );

  // Teams
  await _permissionsService.addRuleToPolicy<Team>(
    globalAdminPolicy,
    'delete',
    Team,
    () => true,
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Team>(
    globalAdminPolicy,
    'list',
    Team,
    () => true,
    'allow',
  );

  // Users
  const globalUserPolicy = await _permissionsService.createPolicy(`User`);

  // Users
  await _permissionsService.addRuleToPolicy<User>(
    globalUserPolicy,
    'read',
    User,
    (user, targetUser) => {
      return user.id === targetUser.id;
    },
    'allow',
  );

  await _permissionsService.addRuleToPolicy<User>(
    globalUserPolicy,
    'update',
    User,
    (user, targetUser) => user.id === targetUser.id,
    'allow',
  );

  await _permissionsService.addRuleToPolicy<User>(
    globalUserPolicy,
    'delete',
    User,
    (user, targetUser) => user.id === targetUser.id,
    'allow',
  );

  await _permissionsService.addRuleToPolicy<User>(
    globalUserPolicy,
    'list',
    User,
    () => true,
    'allow',
  );

  await _permissionsService.addRuleToPolicy<User>(
    globalUserPolicy,
    'resetPassword',
    User,
    (user, targetUser) => user.id === targetUser.id,
    'allow',
  );

  // Organizations
  await _permissionsService.addRuleToPolicy<Organization>(
    globalUserPolicy,
    'read',
    Organization,
    (user, organization) =>
      user.organizations.some(
        (userOrganization) =>
          userOrganization.organization.id === organization.id,
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Organization>(
    globalUserPolicy,
    'list',
    Organization,
    // TODO: Add a rule to allow users to list organizations they are invited to
    (user, organization) =>
      user.organizations.some(
        (userOrganization) =>
          userOrganization.organization.id === organization.id,
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Organization>(
    globalUserPolicy,
    'update',
    Organization,
    (user, organization) =>
      user.organizations.some(
        (userOrganization) =>
          userOrganization.organization.id === organization.id &&
          userOrganization.role === 'ADMIN',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Organization>(
    globalUserPolicy,
    'delete',
    Organization,
    (user, organization) => organization.owner.id === user.id,
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Organization>(
    globalUserPolicy,
    'addTeam',
    Organization,
    (user, organization) =>
      user.organizations.some(
        (userOrganization) =>
          userOrganization.organization.id === organization.id &&
          userOrganization.role === 'ADMIN',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Organization>(
    globalUserPolicy,
    'inviteUser',
    Organization,
    (user, organization) =>
      user.organizations.some(
        (userOrganization) =>
          userOrganization.organization.id === organization.id &&
          userOrganization.role === 'ADMIN',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Organization>(
    globalUserPolicy,
    'removeUser',
    Organization,
    (user, organization, ctx) =>
      ctx.targetUser.id !== user.id &&
      user.organizations.some(
        (userOrganization) =>
          userOrganization.organization.id === organization.id &&
          userOrganization.role === 'ADMIN',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Organization>(
    globalUserPolicy,
    'transferOwnership',
    Organization,
    (user, organization) => organization.owner.id === user.id,
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Organization>(
    globalUserPolicy,
    'leave',
    Organization,
    (user, organization) =>
      user.id !== organization.owner.id &&
      user.organizations.some(
        (userOrganization) =>
          userOrganization.organization.id === organization.id &&
          userOrganization.role === 'MEMBER',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Organization>(
    globalUserPolicy,
    'promoteUser',
    Organization,
    (user, organization) =>
      user.organizations.some(
        (userOrganization) =>
          userOrganization.organization.id === organization.id &&
          userOrganization.role === 'ADMIN',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Organization>(
    globalUserPolicy,
    'demoteUser',
    Organization,
    (user, organization, ctx) =>
      ctx.targetUser.id !== organization.owner.id &&
      user.organizations.some(
        (userOrganization) =>
          userOrganization.organization.id === organization.id &&
          userOrganization.role === 'ADMIN',
      ),
    'allow',
  );

  // Teams
  await _permissionsService.addRuleToPolicy<Team>(
    globalUserPolicy,
    'read',
    Team,
    (user, team) => user.teams.some((userTeam) => userTeam.team.id === team.id),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Team>(
    globalUserPolicy,
    'list',
    Team,
    //TODO: Add a rule to allow users to list teams they are invited to
    (user, team) => user.teams.some((userTeam) => userTeam.team.id === team.id),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Team>(
    globalUserPolicy,
    'update',
    Team,
    (user, team) =>
      user.teams.some(
        (userTeam) => userTeam.team.id === team.id && userTeam.role === 'ADMIN',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Team>(
    globalUserPolicy,
    'delete',
    Team,
    (user, team) =>
      user.teams.some(
        (userTeam) => userTeam.team.id === team.id && userTeam.role === 'ADMIN',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Team>(
    globalUserPolicy,
    'inviteUser',
    Team,
    (user, team) =>
      user.teams.some(
        (userTeam) => userTeam.team.id === team.id && userTeam.role === 'ADMIN',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Team>(
    globalUserPolicy,
    'removeUser',
    Team,
    (user, team, ctx) =>
      ctx.targetUser.id !== user.id &&
      user.teams.some(
        (userTeam) => userTeam.team.id === team.id && userTeam.role === 'ADMIN',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Team>(
    globalUserPolicy,
    'transferOwnership',
    Team,
    (user, team) => team.owner.id === user.id,
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Team>(
    globalUserPolicy,
    'leave',
    Team,
    (user, team) =>
      user.id !== team.owner.id &&
      user.teams.some(
        (userTeam) =>
          userTeam.team.id === team.id && userTeam.role === 'MEMBER',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Team>(
    globalUserPolicy,
    'addProject',
    Team,
    (user, team) =>
      user.teams.some(
        (userTeam) => userTeam.team.id === team.id && userTeam.role === 'ADMIN',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Team>(
    globalUserPolicy,
    'promoteUser',
    Team,
    (user, team) =>
      user.teams.some(
        (userTeam) => userTeam.team.id === team.id && userTeam.role === 'ADMIN',
      ),
    'allow',
  );

  await _permissionsService.addRuleToPolicy<Team>(
    globalUserPolicy,
    'demoteUser',
    Team,
    (user, team, ctx) =>
      ctx.targetUser.id !== team.owner.id &&
      user.teams.some(
        (userTeam) => userTeam.team.id === team.id && userTeam.role === 'ADMIN',
      ),
    'allow',
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
