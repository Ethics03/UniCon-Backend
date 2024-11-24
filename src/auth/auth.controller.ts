import { Controller,Post, Get , Body} from '@nestjs/common';
import { AuthPayloadDTO } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  
  constructor(private authService : AuthService){}




  @Post('login')
    login(@Body() authpayload: AuthPayloadDTO){
        return this.authService.validateUser(authpayload);
}
}
