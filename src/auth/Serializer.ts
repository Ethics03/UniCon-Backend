import {Injectable} from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from "./auth.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(
            private readonly authService: AuthService,

    ){
            super();
    }

    serializeUser(user: any, done: Function): void {
        console.log("Serialized User")
       
        done(null,user.googleId); //removed logs

    }

    async deserializeUser(payload: any, done: Function) {
        try{
        const user = await this.authService.GoogleFindUser(payload);
        console.log("Deserializer User");
        
         done(null,user);
        }
        catch(error){
            
            done(error,null);
        }
    }
}