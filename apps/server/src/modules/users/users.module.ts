import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from '../../providers/prisma';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PostmarkModule } from '../../providers/postmark/postmark.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    PermissionsModule,
    forwardRef(() => OrganizationsModule),
    forwardRef(() => TeamsModule),
    PostmarkModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
