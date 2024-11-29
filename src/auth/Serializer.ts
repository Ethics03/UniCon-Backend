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
        console.log("Serialize User");
        done(null,user);
    }
    async deserializeUser(payload: any, done: Function) {
        const user = await this.authService.GoogleFindUser(payload.id);
        console.log("Deserialize User");
        console.log(user);
        return user ? done(null,user) : done(null,null);
    }
}