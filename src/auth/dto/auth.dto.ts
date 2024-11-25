import { IsNotEmpty, IsString } from 'class-validator';

export class AuthPayloadDTO{
  
  username: string;

  
  password: string;
}

export class AuthResponseDTO{
   
    access_token: string; // The JWT token
}

export class CreateUserDTO{
  @IsNotEmpty()
  @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    email: string;

  @IsNotEmpty()
  @IsString()
    name: string;
}