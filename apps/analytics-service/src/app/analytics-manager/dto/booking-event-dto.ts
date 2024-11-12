import { IsInt, IsISO8601, IsNotEmpty } from 'class-validator';

export class BookingEventDto {
  @IsNotEmpty()
  @IsInt()
  booking_id: number;

  @IsNotEmpty()
  @IsISO8601()
  booking_date: string;

  @IsNotEmpty()
  @IsInt()
  status: number;

  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsInt()
  salon_id: number;

  @IsNotEmpty()
  @IsInt()
  employee_id: number;

  @IsNotEmpty()
  @IsInt()
  payment_id: number;
}
