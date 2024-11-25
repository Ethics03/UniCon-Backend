import { Controller,Post, Get , Body, UseGuards, HttpCode,Res,Request,Delete} from '@nestjs/common';
import { AuthPayloadDTO, CreateUserDTO , AuthResponseDTO} from './dto/auth.dto';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  
  constructor(private authService : AuthService){}




  @Post('login')
    async login(@Body() authpayload: AuthPayloadDTO): Promise<AuthResponseDTO>{

        return await this.authService.login(authpayload);

}

  @Post('register')
    async register(@Body() createduser: CreateUserDTO){
        return await this.authService.createUser(createduser)
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
    };  //`user` will contain the data from the JWT payload (set in the JwtStrategy)
  }

  
}
