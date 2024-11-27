import { Controller, Logger , Post , Body, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BookingService } from './booking.service';
import { CreateBookingDto } from '../dto/create-booking-dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
@Controller('booking')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/generate-booking')
  async createBooking(@Req() req: any,@Body() createBookingDto: CreateBookingDto) {
    const { service_id, salon_id, date, timeSlot } = createBookingDto;
    const user_id = req.user?.userId;
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

  @Cron(CronExpression.EVERY_5_SECONDS) 
  async processSQS() {
    try {
      await this.bookingService.proccessMessages();
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update-booking-completed')
  async updateBookingToCompleted(@Body('bookingUUID') bookingUUID: string) {
    try {
      const booking = await this.bookingService.updateAsCompleted(bookingUUID);
      return booking;
    } catch (error) {
      this.logger.error('Error updating booking via PATCH:', error.message);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get-bookings-by-user-id')
  async getBookingsByUserId(@Req() req: any) {
    const user_id = req.user?.userId;
    try {
      const bookings = await this.bookingService.getAllBookingsByUserId(user_id);
      return bookings;
    } catch (error) {
      this.logger.error('Getting bookings:', error.message);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get-bookings-by-bookingUUID')
  async getBookingsByBookingUUID(@Body('bookingUUID') bookingUUID: string) {
    try {
      const bookings = await this.bookingService.getBookingByBookingUUID(bookingUUID);
      return bookings;
    } catch (error) {
      this.logger.error('Getting bookings:', error.message);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_WEEK) 
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
    const { bookingUUID, payment_id } = payload;
    try {
      const updatedBooking = await this.bookingService.updateBookingStatusToPendingPaymentRealized(
        bookingUUID,payment_id
      );
      this.logger.log(`Booking status updated: ${JSON.stringify(updatedBooking)}`);
      return updatedBooking;
    } catch (error) {
      this.logger.error('Error updating booking status:', error.message);
      throw error;
    }
  }
}
