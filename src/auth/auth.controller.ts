import { Controller,Post, Get , Body, UseGuards,Res,Delete,Request, NotFoundException} from '@nestjs/common';
import { AuthPayloadDTO, CreateUserDTO , AuthResponseDTO} from './dto/auth.dto';
import {Response} from 'express'
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  
  constructor(private authService : AuthService){}


  @Post('login')
    async login(@Body() authpayload: AuthPayloadDTO,@Res() res: Response): Promise<void>{
      
        const loginToken =  this.authService.login(authpayload);

        res.cookie('access_token',(await loginToken).access_token,{
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 6 * 60 * 60 * 1000,
        });

           res.status(200).json({
          access_token: (await loginToken).access_token
        });
}

  @Post('register')
    async register(@Body() createduser: CreateUserDTO, @Res() res:Response): Promise<void>{

      try{
        const newUserToken =  await this.authService.createUser(createduser);

        res.cookie('access_token',newUserToken.access_token,{
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 6 * 60 * 60 * 1000,
        });

        res.status(200).json({access_token: newUserToken.access_token})

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
  @Get('profile')
  getProfile(@Request() req){
    return {
      message: "User Profile Data",
      user: req.user,
    };
  }

  
}
