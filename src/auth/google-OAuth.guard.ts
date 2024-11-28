import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


export class GoogleOAuthGuard extends AuthGuard('google'){}