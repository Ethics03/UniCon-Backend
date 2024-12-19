import { Controller,Post,Get,Body,UseGuards,Res,Delete,NotFoundException,Request,Put,Param,BadRequestException, ParseIntPipe,Req,UnauthorizedException, ValidationPipe, Query} from '@nestjs/common';
import { AuthPayloadDTO, CreateUserDTO , AuthResponseDTO, UpdateUserDTO} from './dto/auth.dto';
import {Response,Request as ExpressRequest} from 'express'
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleOAuthGuard } from './google-OAuth.guard';
import { MailgunService } from './mailgun.service';



@Controller('auth')
export class AuthController {
  
  constructor(
    private authService : AuthService,
    private mailgunService: MailgunService,
  
  ){}


  @Post('login')
    async login(@Body() authpayload: AuthPayloadDTO,@Res({passthrough: true}) res: Response): Promise<AuthResponseDTO>{
      
        const loginToken =  await this.authService.login(authpayload);

        res.cookie('access_token',loginToken.access_token,{
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 6 * 60 * 60 * 1000,
        });

         return loginToken;
}

  @Post('register')
    async register(@Body(new ValidationPipe()) createduser: CreateUserDTO, @Res({passthrough: true}) res:Response): Promise<AuthResponseDTO>{

      try{
        const newUserToken =  await this.authService.createUser(createduser);
        const emailSubject = 'Welcome to Our Platform';
        const emailText = `Hello ${createduser.name},\n\nWelcome to our platform! We are excited to have you on board.`;
        const emailHtml = `<p>Hello ${createduser.name},</p><p>Welcome to our platform! We are excited to have you on board.</p>`;

        await this.mailgunService.sendEmail(createduser.email,emailSubject, emailText, emailHtml);

      
        res.cookie('access_token',newUserToken.access_token,{
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 6 * 60 * 60 * 1000,
        });

        return newUserToken;

      }
      catch(error){
        res.status(500).json({
          message: 'User Registration Failed',
          error: error.message,
        });
      }
    }

  @UseGuards(JwtAuthGuard) 
  @Delete('delete')
     deleteUser(@Request() req){
      const userid = req.user.id; // get user id from the jwt payload
    
      const result =  this.authService.deleteUser(userid);
      return result;
    }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  async updateUser(
    @Param('id',ParseIntPipe) userId: number, // use ParseIntPipe -> by default string
    @Body() updatedata: UpdateUserDTO,
    @Res({passthrough: true}) res: Response):Promise<AuthResponseDTO>{
      
        const UpdatedUserToken = await this.authService.updateUser(userId,updatedata);

        res.cookie('access_token', UpdatedUserToken.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
          sameSite: 'strict',
          maxAge: 6 * 60 * 60 * 1000,  // 6 hours expiration
      });
      return UpdatedUserToken;
    }
  

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req){
    return {
      message: "User Profile Data",
      user: req.user,
    };
  }

  @Get('google/login')
  @UseGuards(GoogleOAuthGuard)
  handlelogin(){
      return {msg: 'Google Authentication'};
  }

  //handles redirect
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async handleRedirect(@Req() req,@Res({passthrough: true}) res: Response){
      const googlePayload = req.user;

      if (!googlePayload) {
        throw new UnauthorizedException('User payload is missing');
    }
      
      const usertoken =  await this.authService.GoogleCreateUser(googlePayload);

      res.cookie('access_token', usertoken.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  
        sameSite: 'strict',
        maxAge: 6 * 60 * 60 * 1000,  // 6 hours expiration
    });

    return usertoken;


}

@Get('status')
checkstatus(@Req() request: ExpressRequest){
    console.log(request.user);
    
    if(request.user){
      return {msg: "Authenticated"};
    }
    else{
      return {msg: "Not Authenticated"};
    }

}   

@Get('verify-email')
async validateEmail(@Query('token') token: string, @Res() res: Response){
  try{
    const userId = await this.authService.verifyVerificationToken(token);

    await this.authService.verifyUserEmail(userId);

    return res.status(200).json({
      message: 'Email verified successfully!',
      userId, //WILL UPDATE TO verification-success frontend rediirect later
    });
    
  }catch(error){
    throw new BadRequestException('Invalid or expired verification token')
  }
}

@Post('forgot-password')
async forgotPassword(@Body('email') email: string , @Res() res:Response){
  try{
    await this.authService.sendResetPasswordEmail(email);
    return res.status(200).json({message: 'Password reset link sent ! '});
  } catch(error){
    throw new NotFoundException('Email not found');
  }
}

@Post('reset-password')
async resetPassword(
  @Query('token') token: string,
  @Body('newPassword') newPassword: string,
  @Res() res: Response
)
{
  try{
    await this.authService.resetPassword(token,newPassword);
    return res.status(200).json({message: 'Password Updated SuccessFully'});
  } catch(error){
    throw new BadRequestException('Invalid or expired token');
  }
}

}
