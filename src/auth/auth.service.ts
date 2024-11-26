import { ConflictException, Injectable , NotFoundException, Param, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthPayloadDTO, AuthResponseDTO , CreateUserDTO} from './dto/auth.dto';
import { JwtPayload } from './jwt-payload.interface';
import { NotFoundError } from 'rxjs';

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


    async createUser(createdata: CreateUserDTO): Promise<AuthResponseDTO>{

        const {username,email} = createdata;
        const existingusername = await this.prisma.users.findUnique({where: {username}});
        const existingemail = await this.prisma.users.findUnique({where: {email}});

        if(existingusername){
            throw new ConflictException('Username already exists. Please choose a different username.');
        }
        if(existingemail){
            throw new ConflictException('An account already exists for this email');
        }




    try{
        

        const hashedpass = await bcrypt.hash(createdata.password,10);
           const newUser = await this.prisma.users.create({
            data: {
                ...createdata,
                password: hashedpass,
            },
        })

        const token = this.jwtService.sign({
            username: newUser.username,
            sub: newUser.id,
        })

        return {
            access_token: token,
    }
    }
    catch (error) {
        throw new Error("Failed to create user. Please try again later.");
    }
    }


    async findUserByUsernameAndId(username: string, userId: number) {
        return await this.prisma.users.findUnique({
            where: { username, id: userId }, // Ensure you match both username and userId
        });
    }
    
    async deleteUser(userId: number) {
        
        const user =  await this.prisma.users.findUnique({
            where: {id: userId },// Ensure you match both username and userId
        });

        if(!user){
            throw new NotFoundException('User Not Found');
        }
        await this.prisma.users.delete({
            where: { id: userId }
          });
          return { message: 'User deleted successfully' };
    }

    



    async login(payload : AuthPayloadDTO): Promise<AuthResponseDTO>{

        const user = await this.validateUser(payload)
        

        const token = this.jwtService.sign({
            username: user.username,
            sub: user.id,
        })
        
        return {access_token: token}
    }


}

