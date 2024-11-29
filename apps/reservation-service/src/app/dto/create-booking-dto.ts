<<<<<<< HEAD
<<<<<<< HEAD
import {
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsString,
  } from 'class-validator';
  
  export class CreateBookingDto {

    @IsNotEmpty()
    @IsDate()
    booking_date: Date;
    
    @IsNotEmpty()
    @IsNumber()
    user_id: number;

    @IsNotEmpty()
    @IsNumber()
    salon_id: number;

    @IsNotEmpty()
    @IsNumber()
    service_id: number;

    @IsString()
    status: string;
  
    @IsNotEmpty()
    @IsNumber()
    payment_id: number;
 
  }
  
=======
=======
>>>>>>> origin/develop
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
<<<<<<< HEAD
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
=======
>>>>>>> origin/develop
