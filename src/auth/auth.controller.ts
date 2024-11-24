import { Controller,Post, Get , Body} from '@nestjs/common';
import { AuthPayloadDTO, CreateUserDTO , AuthResponseDTO} from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  
  constructor(private authService : AuthService){}




  @Post('login')
    login(@Body() authpayload: AuthPayloadDTO){
        return this.authService.validateUser(authpayload);
}

  @Post('register')
    async register(@Body() createduser: CreateUserDTO){
        return await this.authService.createUser(createduser);
    }
}
