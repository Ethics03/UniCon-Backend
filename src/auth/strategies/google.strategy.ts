import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth2";
import { VerifyCallback } from "passport-google-oauth2";
import { GoogleAuthPayloadDTO, GoogleUserDTO } from "../dto/auth.dto";
import { AuthService } from "../auth.service";
import { ConflictException, Injectable, UnauthorizedException,Logger} from "@nestjs/common"




@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){

    private readonly logger = new Logger(GoogleStrategy.name); 

    constructor(private readonly Authservice: AuthService){
        
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['profile','email'],
        });

    }

    async validate(
        accesstoken: string,
        refreshtoken: string,
        profile: any,
        done: VerifyCallback,
    ):Promise<any>{

    try{

            const {name,emails,photos,id} = profile;

            
            const userPayload: GoogleUserDTO = {
                email: emails[0].value,
                firstName: name.givenName,
                lastName: name.familyName,
                accesstoken,
                googleId: id, // Extract googleId from profile
                pictureUrl: photos[0].value, // Extracted pictureUrl from profile
            };
         
            done(null,userPayload);
        }
        catch(error){
            this.logger.error('Error during Google OAuth validation', error.stack);
            done(error,null); 
        }
    }
}
