import { IsInt, IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class BookingEventDto {
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsISO8601()
  booking_date: string;
  
  @IsNotEmpty()
  time_slot: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsInt()
  salon_id: number;

  @IsNotEmpty()
  @IsInt()
  service_id: number;
  
  @IsNotEmpty()
  @IsString()
  bookingUUID: string;
  
  @IsNotEmpty()
  @IsString()
  payment_id: string;
}
