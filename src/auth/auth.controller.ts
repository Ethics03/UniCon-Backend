import { Controller,Post,Get,Body,UseGuards,Res,Delete,NotFoundException,Request,Put,Param,BadRequestException, ParseIntPipe,Req,UnauthorizedException, ValidationPipe} from '@nestjs/common';
import { AuthPayloadDTO, CreateUserDTO , AuthResponseDTO, UpdateUserDTO} from './dto/auth.dto';
import {Response,Request as ExpressRequest} from 'express'
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleOAuthGuard } from './google-OAuth.guard';



@Controller('auth')
export class AuthController {
  
  constructor(private authService : AuthService){}


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

}
