import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class BookingEventDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  UserId: string;

  @IsString()
  @IsNotEmpty()
  BeautySalonID: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  timeStr: string;

  @IsString()
  @IsNotEmpty()
  service: string;

  @IsString()
  @IsOptional()
  SalonName?: string;

  @IsString()
  @IsOptional()
  UserName?: string;
}