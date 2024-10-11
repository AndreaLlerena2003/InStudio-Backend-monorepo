import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateBookingDto } from '../dto/create-booking-dto';
import { PendingBookingService } from './pending.service';

@Controller('booking-pending')
export class BookingPendingController {
  constructor(private readonly pendingBookingService: PendingBookingService) {}

  @Post()
  async createOrder(@Body() request: CreateBookingDto) {
    return this.pendingBookingService.createPendingBooking(request);
  }

 
}
