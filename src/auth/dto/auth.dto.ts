import { IsNotEmpty, IsString , IsOptional, IsEmail} from 'class-validator';

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
    @IsEmail()
    email: string;

  @IsNotEmpty()
  @IsString()
    name: string;
}

export class UpdateUserDTO {
  @IsOptional() 
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  name? : string;
}

export class GoogleUserDTO{
  @IsString()
  email: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  picture: string;

  @IsOptional()
  @IsString()
  accessToken?: string; //optional
}