import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//auth guard middleware
//THIS IS WHAT HELPS US TO REDIRECT TO THE GOOGLE AUTH PAGE
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google'){
    async canActivate(context: ExecutionContext) {
        const activate = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();
        await super.logIn(request);
        return activate;
    }
    
}