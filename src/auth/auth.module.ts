import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleOAuthGuard } from './google-OAuth.guard';
import { SessionSerializer } from './Serializer';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),

    PrismaModule,
    PassportModule.register({session: true}),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {expiresIn: '6h'},

    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy,PrismaService,GoogleStrategy,GoogleOAuthGuard,SessionSerializer],
})
export class AuthModule {}
