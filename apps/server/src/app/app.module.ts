import { Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { OrganizationsModule } from '../modules/organizations/organizations.module';
import { AppController } from './app.controller';

@Module({
  imports: [AuthModule, UsersModule, OrganizationsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
