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
  