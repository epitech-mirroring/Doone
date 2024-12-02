import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { PrismaModule } from '../../providers/prisma';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PrismaModule, AuthModule, PermissionsModule],
  providers: [TeamsService],
})
export class TeamsModule {}
