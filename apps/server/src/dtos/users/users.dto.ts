import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RegisterDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class VerifyEmailDTO {
  @IsNotEmpty()
  @IsNumber()
  verificationCode: number;
}
