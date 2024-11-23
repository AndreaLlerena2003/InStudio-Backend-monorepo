import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { AvailabilityService } from '../availability-manager/availability.service';

@Injectable()
export class BookingService {

    private readonly logger = new Logger(BookingService.name);

    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly availabilityService: AvailabilityService
    ) {}


    async verifyAndUpdateAllBookingStatus() {
        const allBookings = await this.bookingRepository.find({}); 
        const currentDateTime = new Date();
        for (const booking of allBookings) {
          const { booking_date, time_slot, bookingUUID } = booking;
          const bookingDateTime = new Date(`${booking_date}T${time_slot}`);
          this.logger.log('cur: ',currentDateTime);
          this.logger.log('bok: ',bookingDateTime);
          if (bookingDateTime <= currentDateTime && booking.status !== 'COMPLETED') {
            booking.status = 'COMPLETED';
            await this.updateBookingStatus(bookingUUID, 'COMPLETED');
          }
        }
    }

    async updateBookingStatus(bookingUUID: string, status: string) {
        const filterQuery = { bookingUUID };
            const updateData = { status: status };
            const updatedBooking = await this.bookingRepository.upsert(filterQuery, updateData);
            if (!updatedBooking) {
                this.logger.warn(`Booking with UUID ${bookingUUID} not found during upsert`);
                throw new NotFoundException(`Booking with UUID ${bookingUUID} not found`);
            }
    }

    async generateBooking(user_id: string, service_id: number, salon_id: number, date: string, timeSlot: string) {
        const isAvailable = await this.availabilityService.checkAvailability(date, timeSlot, salon_id);
        if (!isAvailable) {
            this.logger.warn(`Slot not available for salon ${salon_id} on ${date} at ${timeSlot}`);
            throw new NotFoundException('The selected time slot is not available.');
        }
        try {
            const booking = await this.bookingRepository.create({
                user_id: user_id,
                service_id: service_id,
                salon_id: salon_id,
                booking_date: date,
                time_slot: timeSlot, 
                status: 'PENDING_TO_PAY'
            });

            this.logger.log(`Booking created successfully for user ${user_id} at salon ${salon_id}`);
            return booking; 
        } catch (error) {
            this.logger.error('Error creating booking:', error);
            throw new Error('Failed to create booking.');
        }
    }

    async updateBookingStatusToPendingPaymentRealized(bookingUUID: string) {
        try {
            const filterQuery = { bookingUUID };
            const updateData = { status: 'PENDING_PAYMENT_REALIZED' };
            const updatedBooking = await this.bookingRepository.upsert(filterQuery, updateData);
            if (!updatedBooking) {
                this.logger.warn(`Booking with UUID ${bookingUUID} not found during upsert`);
                throw new NotFoundException(`Booking with UUID ${bookingUUID} not found`);
            }

            this.logger.log(`Booking ${bookingUUID} status updated to PENDING_PAYMENT_REALIZED`);
            const booking = await this.bookingRepository.findOne({ bookingUUID });
            if (!booking) {
                this.logger.error(`Booking with UUID ${bookingUUID} was not found after upsert`);
                throw new NotFoundException(`Booking with UUID ${bookingUUID} not found`);
            }
            await this.availabilityService.reserveSlot(
                booking.booking_date,
                booking.time_slot,
                booking.salon_id,
                booking.service_id
            );

            this.logger.log(
                `Slot reserved for booking ${bookingUUID} on ${booking.booking_date} at ${booking.time_slot}`
            );

            return updatedBooking;
        } catch (error) {
            this.logger.error(`Error updating booking ${bookingUUID} status:`, error);
            throw new Error('Failed to update booking status.');
        }
    }


}
