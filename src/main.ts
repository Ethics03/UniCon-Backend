import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); //enabled cookie parser middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
     cookie: {
        httpOnly: true,  // helps mitigate XSS attacks
        maxAge: 1000 * 60 * 60 * 6, // expires after 6 hours
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
