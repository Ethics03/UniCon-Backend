
export class AuthPayloadDTO{

  username: string;

  password: string;
}

export class AuthResponseDTO{
   
    access_token: string; // The JWT token
}

export class CreateUserDTO{
    username: string;

    password: string;

    email: string;

    name: string;
}