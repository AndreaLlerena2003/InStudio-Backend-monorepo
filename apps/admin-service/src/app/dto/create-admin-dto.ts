import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAdminDto {
    
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly profile_photo_url?: string;

}
