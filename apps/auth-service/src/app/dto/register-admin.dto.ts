import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';


export class RegisterAdminDto {
  
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6) 
  password: string;

  @IsString()
  @IsOptional()
  profile_photo_url?: string;

}
