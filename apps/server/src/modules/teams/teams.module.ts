import { forwardRef, Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { PrismaModule } from '../../providers/prisma';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PermissionsModule,
    forwardRef(() => UsersModule),
    forwardRef(() => OrganizationsModule),
  ],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
