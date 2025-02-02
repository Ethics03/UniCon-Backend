import { ConflictException, Injectable , NotFoundException, Param, UnauthorizedException , InternalServerErrorException,Logger, BadRequestException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthPayloadDTO, AuthResponseDTO , CreateUserDTO, GoogleAuthPayloadDTO, GoogleUserDTO, UpdateUserDTO} from './dto/auth.dto';
import { JwtPayload } from './jwt-payload.interface';
import { MailgunService } from './mailgun.service';


@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService : JwtService,
        private readonly prisma: PrismaService,
        private mailgunService: MailgunService
    ){}

    private readonly logger = new Logger(AuthService.name);
    //VALIDATING USER
    async validateUser(logindto: AuthPayloadDTO): Promise<any>{
        const {username,password} = logindto

        
        //jwt validation 
        const user = await this.prisma.users.findUnique({where: {username}});
        if(user && (await bcrypt.compare(password , user.password))){
                const{password: _, ...result} = user;
                return result;
        }
        
        throw new UnauthorizedException('Invalid Credentials');
        }

    
    async GoogleFindUser(googleid: string){
        const user = await this.prisma.users.findUnique({where: {googleId: googleid},});
        return user;
    }

    //CREATING USER (JWT)
    async createUser(createdata: CreateUserDTO): Promise<AuthResponseDTO>{

        const {username,email} =  createdata;
        const existingusername = await this.prisma.users.findUnique({where: {username}});
        const existingemail = await this.prisma.users.findUnique({where: {email}});

        if(existingusername){
            throw new ConflictException('Username already taken. Please try again.');
        }
        if(existingemail){
            throw new ConflictException('Email already registered. Please try again.');
        }

    try{
        
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

        const hashedpass = await bcrypt.hash(createdata.password,saltRounds);
           const newUser = await this.prisma.users.create({
            data: {
                ...createdata,
                password: hashedpass,
                isVerified: false,
                verificationToken: this.jwtService.sign(
                    {
                    username: createdata.email,
                },
            {
                secret: process.env.JWT_SECRET_KEY,
                expiresIn: '1h',
            })
            },
        });

        const verificationtoken = this.generateVerificationJwt(newUser);
        
        await this.mailgunService.sendVerificationEmail(newUser.email,verificationtoken.access_token);

        const token = this.jwtService.sign({
            username: newUser.username,
            sub: newUser.id,
        },
        {
            secret: process.env.JWT_SECRET_KEY, 
            expiresIn: '6h', 
          });

        
        
     return {
            access_token: token,
    }
    }
    catch (error) {
        throw new InternalServerErrorException('Failed to create user. Please try again later.');
    }
    }


    async findUserById(userId: number) {
        return await this.prisma.users.findUnique({
            where: {id: userId }, // Ensure you match both username and userId
        });
    }

    //CREATING AND VALIDATING USER
    async GoogleCreateUser(googlePayload: GoogleAuthPayloadDTO): Promise<AuthResponseDTO>{
        const {googleId,email,pictureUrl} = googlePayload;

        


        if (!googleId || !email) {
            throw new Error('Google ID or Email is required for this operation.');
          }
          
          let user = googleId
          ? await this.prisma.users.findUnique({ where: { googleId } })
          : null;

        if(!user && email){
            user = await this.prisma.users.findUnique({ where: { email } });
        }

        if(user){
            return this.generateJwtToken(user);
                }


        console.log(googlePayload);
        try{
            //fallback username if username not provided
            const username = email.split('@')[0];
            
            const newUser = await this.prisma.users.create({
                data: {
                    googleId,
                    email,
                    username,
                    pictureUrl,
                    isVerified: true,
                },
            });
            return this.generateJwtToken(newUser);
        }
        catch(error){
          throw new InternalServerErrorException('Failed to Create User with Google OAuth. Try Again');
        }
        
    }
    

    //DELETING USER
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

    //UPDATING USER
    async updateUser(userId: number, updatedata: UpdateUserDTO): Promise<AuthResponseDTO>{
        const user = await this.prisma.users.findUnique({
            where: {id: userId},
        });

        if(!user){
            throw new NotFoundException('User not found.')
        }
        const existingUsername = await this.prisma.users.findUnique({
            where: { username: updatedata.username },
        });
        const existingEmail = await this.prisma.users.findUnique({
            where: { email: updatedata.email },
        });

        if(existingUsername && existingUsername.id != userId){
            throw new ConflictException('Username is already taken.');
        }
        if(existingEmail && existingEmail.id != userId){
            throw new ConflictException('Email is already taken.');
        }

    try{
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
        if(updatedata.password){
            updatedata.password = await bcrypt.hash(updatedata.password,saltRounds);
        }

        const updatedUser = await this.prisma.users.update({
            where: {id: userId},
            data: updatedata
        });

        const UpdatedUsertoken = this.jwtService.sign({
            username: updatedUser.username,
            sub: updatedUser.id
        },
        {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: '6h',
        });
        return{
            access_token: UpdatedUsertoken
        };
    }
    catch(error){
        throw new InternalServerErrorException('Error Updating. Try Again');
    }
        
    }



    //LOGGING IN AND CREATING TOKEN
    async login(payload : AuthPayloadDTO): Promise<AuthResponseDTO>{

        const user = await this.validateUser(payload)
        

        const token = this.jwtService.sign({
            username: user.username,
            sub: user.id,
        },
        {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: '6h', 
          })
          
        this.logger.log(`User logged in successfully: ${user.username}`);
        return {access_token: token}
    }

     generateJwtToken(user: any): AuthResponseDTO{

        const token = this.jwtService.sign(
            {
            username: user.username,
            sub: user.id,
        },
    {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: '6h',
    });
    
    return {
        access_token: token,
    }
    }

    generateVerificationJwt(user: any): AuthResponseDTO {
        const token = this.jwtService.sign(
          {
            sub: user.id, 
          },
          {
            secret: process.env.JWT_SECRET_KEY, 
            expiresIn: '1h', 
          },
        );
    
        return {
          access_token: token,
        };
      }

    async verifyVerificationToken(token: string): Promise<number> {
        try{
            const decoded = this.jwtService.verify(token,{
                secret: process.env.JWT_SECRET_KEY,
            });

            return decoded.sub;
        }
        catch(error){
            throw new UnauthorizedException('Invalid or expired verification token');
        }
    }

    async verifyUserEmail(userId: number): Promise<void>{
        const user = await this.prisma.users.findUnique({
            where: {id: userId},
        });

        if(!user){
            throw new UnauthorizedException('User not Found');
        }

        if(user.isVerified){
            throw new UnauthorizedException('User already verified');
        }

        await this.prisma.users.update({
            where: {id: userId},
            data: {isVerified: true},
        })
    }

    //SENDING RESET PASSWORD MAIL SERVICE
    async sendResetPasswordEmail(email: string){
            const user = await this.prisma.users.findUnique({where: {email}});

            if(!user){
                throw new NotFoundException;
            }

            const token = this.jwtService.sign(
                {
                    username: user.username,
                    userId: user.id,  
                },
                {
                    secret: process.env.JWT_SECRET_KEY,
                    expiresIn: '6h',
                }
            );

            const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
            const emailSubject = 'Reset Your Password';
            const emailText = `Click the link to reset your password: ${resetLink}`;
            const emailHtml = `<p>Click the link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`;

            await this.mailgunService.sendEmail(user.email,emailSubject,emailText,emailHtml);
        
    }


    //RESET PASSWORD SERVICE
    async resetPassword(token: string , newPassword: string){
        try{
            const payload = this.jwtService.verify(token,{secret: process.env.JWT_SECRET_KEY});
            const user = await this.prisma.users.findUnique({where: {id: payload.userId}});

            if(!user){
                throw new BadRequestException("Invalid Token");
            }
            

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await this.prisma.users.update({
                where: {id: user.id},
                data: {password: hashedPassword},
            });
        }  catch(error){
            throw new BadRequestException("Invalid or expired Token");
        }
    }

      
}