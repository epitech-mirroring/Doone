import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthContext } from './auth.context';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../providers/prisma';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthContext],
  exports: [AuthContext, AuthService],
})
export class AuthModule {}
