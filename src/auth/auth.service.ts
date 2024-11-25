import { Injectable , NotFoundException, Param, UnauthorizedException} from '@nestjs/common';
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

    async createUser(createdata: CreateUserDTO){
        

    try{
        const hashedpass = await bcrypt.hash(createdata.password,10);

        return this.prisma.users.create({
            data: {
                ...createdata,
                password: hashedpass,
            },
        })
    }
    catch (error) {
        console.error("Error creating user:", error);
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
        
        return {
                access_token: token,
        }
    }


}

