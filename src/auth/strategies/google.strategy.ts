import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth2";
import { VerifyCallback } from "passport-jwt";
import { GoogleUserDTO } from "../dto/auth.dto";

export class GoogleStrategy extends PassportStrategy(Strategy){
    constructor(){
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
            const {name,emails,photos} = profile;

            const user: GoogleUserDTO = {
                email: emails[0].value,
                firstName: name.givenName,
                lastName: name.familyName,
                picture: photos[0].value
            }

            console.log(profile);
            console.log(accesstoken); 


    }
}
