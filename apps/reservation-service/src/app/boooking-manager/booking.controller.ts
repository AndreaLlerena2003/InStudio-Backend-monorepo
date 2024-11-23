import { Controller, Logger , Post , Body, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BookingService } from './booking.service';
import { CreateBookingDto } from '../dto/create-booking-dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('booking')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post('/generate-booking')
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    const { user_id, service_id, salon_id, date, timeSlot } = createBookingDto;
    try {
      const booking = await this.bookingService.generateBooking(
        user_id,
        service_id,
        salon_id,
        date,
        timeSlot,
      );
      this.logger.log(`Booking created successfully via POST: ${JSON.stringify(booking)}`);
      return booking;
    } catch (error) {
      this.logger.error('Error creating booking via POST:', error.message);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES) 
  async verifyAndUpdateAllBookingStatus() {
    try {
      this.logger.log('Verifying and updating all booking statuses...');
      await this.bookingService.verifyAndUpdateAllBookingStatus();
    } catch (error) {
      this.logger.error('Error verifying and updating booking statuses:', error.message);
      throw error;
    }
  }

  @EventPattern('update_booking_status')
  async handleUpdateBookingStatus(@Payload() payload: any) {
    const { bookingUUID } = payload;
    try {
      const updatedBooking = await this.bookingService.updateBookingStatusToPendingPaymentRealized(
        bookingUUID,
      );
      this.logger.log(`Booking status updated: ${JSON.stringify(updatedBooking)}`);
      return updatedBooking;
    } catch (error) {
      this.logger.error('Error updating booking status:', error.message);
      throw error;
    }
  }
}
