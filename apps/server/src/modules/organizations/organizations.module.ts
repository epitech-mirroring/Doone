import { forwardRef, Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { PrismaModule } from '../../providers/prisma';
import { OrganizationsController } from './organizations.controller';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { UsersModule } from '../users/users.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    PrismaModule,
    PermissionsModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => TeamsModule),
  ],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
