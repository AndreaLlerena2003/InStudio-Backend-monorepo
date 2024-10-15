import { IsString, IsOptional, IsNotEmpty, IsUUID , IsEmail} from 'class-validator';

export class CreateUserDto {
  
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  profile_photo_url?: string;


  @IsUUID()
  @IsOptional()
  districtId?: string;  

}
