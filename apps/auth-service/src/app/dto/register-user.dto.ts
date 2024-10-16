import { IsString, IsEmail, IsNotEmpty, MinLength, IsUUID, IsOptional } from 'class-validator';


export class RegisterUserDto {
  
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


  @IsUUID()
  @IsOptional()
  districtId?: string;  

}
