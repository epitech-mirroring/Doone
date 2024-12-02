import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PrismaModule } from '../../providers/prisma';
import { ResourcesService } from './resources.service';

@Module({
  imports: [PrismaModule],
  providers: [PermissionsService, ResourcesService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
