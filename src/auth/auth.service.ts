import { Injectable , UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthPayloadDTO, AuthResponseDTO , CreateUserDTO} from './dto/auth.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService : JwtService,
        private readonly prisma: PrismaService,
    ){}

    async validateUser(logindto: AuthPayloadDTO): Promise<any>{
        const {username,password} = logindto

        const user = await this.prisma.users.findUnique({where: {username}});
        if(user && (await bcrypt.compare(password , user.password))){
                const{password: _, ...result} = user;
                return result;
        }
        
        throw new UnauthorizedException('Invalid Credentials');
        }

    async createUser(createdata: CreateUserDTO){
        const hashedpass = await bcrypt.hash(createdata.password,10);

        return this.prisma.users.create({
            data: {
                ...createdata,
                password: hashedpass,
            },
        })
    }

    async findUserByUsernameAndId(username: string, userId: number) {
        return await this.prisma.users.findUnique({
            where: { username, id: userId }, // Ensure you match both username and userId
        });
    }
    
    async login(payload : AuthPayloadDTO): Promise<AuthResponseDTO>{

        const user = await this.validateUser(payload)
        

        const token = this.jwtService.sign({
            username: user.username,
            sub: user.id,
        })
        
        return {
                access_token: token,
        }
    }


}

