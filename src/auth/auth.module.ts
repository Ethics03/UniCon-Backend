import { Injectable, Module } from '@nestjs/common';
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
import { MailgunModule  } from 'nestjs-mailgun';


@Module({
  imports: [
    
    ConfigModule.forRoot({isGlobal:true}),
    MailgunModule.forRoot({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
      timeout: 30000,
      url: "https://api.mailgun.net/v3/sandbox96f735e344b1489e85ff4708efa12c16.mailgun.org/messages", // or your own Mailgun domain
    }),
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
