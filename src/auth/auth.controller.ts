import { Controller,Post, Get , Body} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  
  @Post('login')
    login(@Body() data){

}
}
