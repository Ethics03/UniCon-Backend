import { Injectable , NotFoundException} from '@nestjs/common';
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

        const {sub: userId} = payload;
        const user = await this.authservice.findUserById(userId);

        if(!user){
            throw new NotFoundException('User not found')
        }

        return {id: userId,username: user.username}; //make sure u put the attributes of the user and match it with the JWTpayload

    }
}