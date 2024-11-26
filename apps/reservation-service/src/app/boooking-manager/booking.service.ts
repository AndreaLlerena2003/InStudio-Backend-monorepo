import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { AvailabilityService } from '../availability-manager/availability.service';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import {SQSService} from '../infraestructure/sqs.service';
import { randomUUID, UUID } from 'crypto';

@Injectable()
export class BookingService {

    private readonly logger = new Logger(BookingService.name);

    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly availabilityService: AvailabilityService,
        private readonly kafkaService: KafkaService,
        private readonly sqsService: SQSService
    ) {
        this.kafkaService.init();
    }


    async verifyAndUpdateAllBookingStatus() {
        const allBookings = await this.bookingRepository.find({}); 
        const currentDateTime = new Date();
        for (const booking of allBookings) {
          const { booking_date, time_slot, bookingUUID } = booking;
          const bookingDateTime = new Date(`${booking_date}T${time_slot}`);
          if (bookingDateTime <= currentDateTime && booking.status !== 'COMPLETED') {
            booking.status = 'COMPLETED';
            await this.updateBookingStatus(bookingUUID, 'COMPLETED');
          }
        }
    }

    async updateAsCompleted(bookingUUID: string) {
        const filterQuery = { bookingUUID };
        const updateData = { status: 'COMPLETED' };
    
        const result = await this.bookingRepository.upsert(filterQuery, updateData);
        if (!result) {
            this.logger.warn(`Booking with UUID ${bookingUUID} not found during upsert`);
            throw new NotFoundException(`Booking with UUID ${bookingUUID} not found`);
        }
        const updatedBooking = await this.bookingRepository.findOne(filterQuery);
        await this.kafkaService.sendEvent(updatedBooking, 'booking-completed');
        return updatedBooking;
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

    async proccessMessages(){
       try{
            const messages = await this.sqsService.receiveMessages();
            if (!messages|| messages.length === 0) return;
            for (const message of messages){
                const bookingRequest = JSON.parse(message.Body);
                this.logger.log(`Processing booking request: ${JSON.stringify(bookingRequest)}`);
                try{
                    const isAvailable = await this.availabilityService.checkAvailability(
                        bookingRequest.date,
                        bookingRequest.timeSlot,
                        bookingRequest.salon_id,
                      );
            
                      if (!isAvailable) {
                        this.logger.warn(`Slot not available for booking: ${message.Body}`);
                        continue;
                      }

                      await this.availabilityService.reserveSlot(
                        bookingRequest.date,
                        bookingRequest.timeSlot,
                        bookingRequest.salon_id,
                        bookingRequest.service_id
                        
                        );

                      await this.bookingRepository.create({
                        bookingUUID: bookingRequest.bookingUUID,
                        user_id: bookingRequest.user_id,
                        service_id: bookingRequest.service_id,
                        salon_id: bookingRequest.salon_id,
                        booking_date: bookingRequest.date,
                        time_slot: bookingRequest.timeSlot,
                        status: 'PENDING_TO_PAY',
                      });
            
                      this.logger.log(`Booking successfully created for user ${bookingRequest.user_id}`);
                }catch(error){
                    this.logger.error(`Error processing booking request: ${message.Body}`, error);
                }

                await this.sqsService.deleteMessage(message.ReceiptHandle);
            }
       }catch(error){
            this.logger.error('Error receiving messages from SQS:', error);
       }
    }

    async generateBooking(user_id: string, service_id: number, salon_id: number, date: string, timeSlot: string) {
        const bookingUUID = randomUUID();
        const messageBody = {
            bookingUUID,
            user_id,
            service_id,
            salon_id,
            date,
            timeSlot,
        };
    
        try {
            await this.sqsService.sendMessage(messageBody);
            this.logger.log(`Booking request queued for user ${user_id} at salon ${salon_id}`);
            
            return {
                body: {bookingUUID: bookingUUID},
                message: 'Booking request received and is being processed.',
                status: 'PENDING', 
            };
        } catch (error) {
            this.logger.error('Error queuing booking request:', error);
            throw new Error('Failed to queue booking request.');
        }
    }
    

    async updateBookingStatusToPendingPaymentRealized(bookingUUID: string, payment_id: string) {
        try {
            const filterQuery = { bookingUUID };
            const updateData = { status: 'PENDING_PAYMENT_REALIZED', payment_id: payment_id };
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
            await this.kafkaService.sendEvent(booking,'reservation-created');
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
