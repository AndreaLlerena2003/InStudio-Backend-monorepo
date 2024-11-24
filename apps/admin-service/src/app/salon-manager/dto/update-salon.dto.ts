import { IsOptional, IsString, IsArray, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateSalonDto {

  @IsNotEmpty()
  @IsNumber()
  salonId: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  schedule?: { day: string; hours: string[] }[];
}
