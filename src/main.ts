import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{logger: ['log', 'warn', 'error'],});
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
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
