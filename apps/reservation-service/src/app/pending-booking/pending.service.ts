import { Injectable, Logger } from '@nestjs/common';
import { PendingBookingRepository } from './pending.repository';
import { Booking } from '../schemas/booking.schema';
import { CreateBookingDto } from '../dto/create-booking-dto';
@Injectable()
export class PendingBookingService {
  private readonly logger = new Logger(PendingBookingService.name);
  constructor(private readonly pendingBookingRepository: PendingBookingRepository) {}

  async findPendingBookings(): Promise<Booking[]> {
    this.logger.log('Fetching all pending bookings');
    return this.pendingBookingRepository.find({ status: 'pending' });
  }

  async createPendingBooking(bookingData: CreateBookingDto): Promise<Booking> {
    this.logger.log('Creating a new pending booking');
    bookingData.status = 'pending'; 
    return this.pendingBookingRepository.create(bookingData);
  }
  
}
