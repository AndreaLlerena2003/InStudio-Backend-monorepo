import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookingEventDto } from './dto/booking-event-dto';
import { AnalyticsManagerService } from './analytics-manager.service';

@Controller('analytics-manager')
export class AnalyticsManagerController {
  constructor(private readonly analyticsManagerService: AnalyticsManagerService) {}

  @Get() 
  helloWorld() {
    return this.analyticsManagerService.helloWorld();
  } 

  @Post()
  async processBookingEvent(@Body() bookingEventDto: BookingEventDto) {
    const result = await this.analyticsManagerService.processBookingEvent
    (bookingEventDto);

    // En realidad no debería retornar nada, ya que es un evento
    return {
      message: 'Booking register created successfully',
      data: result,
    };
  }
}
