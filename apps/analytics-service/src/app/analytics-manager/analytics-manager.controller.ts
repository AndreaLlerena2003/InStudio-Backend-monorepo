import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { BookingEventDto } from './dto/booking-event-dto';
import { AnalyticsManagerService } from './analytics-manager.service';
import { MetricsDto } from './dto/metrics-dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
@Controller('analytics-manager')
export class AnalyticsManagerController {
  constructor(
    private readonly analyticsManagerService: AnalyticsManagerService
  ) {}

  @Get()
  helloWorld() {
    return this.analyticsManagerService.helloWorld();
  }

  @EventPattern('reservation-created')
  async handleReservationCreated(@Payload() bookingEventDto: BookingEventDto) {
    const result = await this.analyticsManagerService.processBookingEvent(
      bookingEventDto
    );
    // En realidad no debería retornar nada, ya que es un evento
    return {
      message: 'Booking register created successfully',
      data: result,
    };
  }

  @Post('/process-booking-event')
  async processBookingEvent(@Body() bookingEventDto: BookingEventDto) {
    const result = await this.analyticsManagerService.processBookingEvent(
      bookingEventDto
    );
    // En realidad no debería retornar nada, ya que es un evento
    return {
      message: 'Booking register created successfully',
      data: result,
    };
  }

  @Post('/data')
  async getData(@Body() metricDto: MetricsDto) {
    const result = await this.analyticsManagerService.getData(metricDto);
    return {
      message: result,
      status: 200,
    };
  }

  @Post('/downloadData')
  async downloadData(@Body() metricDto: MetricsDto) {
    const result = await this.analyticsManagerService.downloadData(metricDto);

    return {
      ...result,
    };
  }
}
