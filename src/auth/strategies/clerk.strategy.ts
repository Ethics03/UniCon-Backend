import { Injectable , UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClerkClient } from '@clerk/express';
import { Request } from 'express';