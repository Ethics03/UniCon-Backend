import { IsNotEmpty, IsString , IsOptional, IsEmail} from 'class-validator';

export class AuthPayloadDTO{
  
  @IsString()
  username: string;
  @IsString()
  password: string;
  
}




export class GoogleAuthPayloadDTO{


  @IsNotEmpty()
  @IsString()
  googleId: string; 

  
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  pictureUrl?: string

  @IsOptional()
  @IsString()
  name?: string;

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
  googleId: string;

  @IsString()
  email: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  pictureUrl: string;

  @IsOptional()
  @IsString()
  accesstoken?: string; //optional

}