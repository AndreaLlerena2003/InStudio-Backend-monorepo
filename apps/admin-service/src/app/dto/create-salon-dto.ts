import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateSalonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  profile_photo_url: string;

  @IsString()
  @IsOptional()
  banner_photos_url: string[];

  @IsNumber()
  @IsOptional()
  adminId: number; 

}
