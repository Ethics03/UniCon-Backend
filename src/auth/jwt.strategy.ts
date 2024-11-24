import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt-payload.interface';
@Injectable()

export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private authservice: AuthService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET_KEY,
        });
    }

    async validate(payload: JwtPayload){

        const {username,sub: userId} = payload;
        const user = await this.authservice.findUserByUsernameAndId(username,userId);


        if(!user){
            throw new Error('User not found')
        }

        return {userId,username};

    }
}