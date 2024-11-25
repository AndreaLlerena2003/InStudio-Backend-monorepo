import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  service_id: number;

  @IsNumber()
  @IsNotEmpty()
  salon_id: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  timeSlot: string;
}
