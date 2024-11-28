import { Injectable, Logger, NotFoundException, Inject, OnModuleInit } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { AvailabilityService } from '../availability-manager/availability.service';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import {SQSService} from '../infraestructure/sqs.service';
import { randomUUID, UUID } from 'crypto';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BookingService implements OnModuleInit{

    private readonly logger = new Logger(BookingService.name);

    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly availabilityService: AvailabilityService,
        private readonly kafkaService: KafkaService,
        private readonly sqsService: SQSService,
        @Inject('admin-client') private readonly kafkaClient: ClientKafka,
        @Inject('auth-client') private readonly authClient: ClientKafka,
        @Inject('offers-client') private readonly offersClient: ClientKafka,
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

    
    async onModuleInit() {
        try {
            console.log('[JwtAuthGuard] Subscribing to Kafka topics...');
            await this.authClient.subscribeToResponseOf('validate_user');
            await this.authClient.subscribeToResponseOf('validate_user.reply'); // Add explicit subscription for reply topic
            console.log('[JwtAuthGuard] Subscribed to Kafka topics successfully');

            console.log('[JwtAuthGuard] Connecting to Kafka...');
            await this.authClient.connect(); // Ensure the Kafka cient is connected
            //this.authClient.subscribeToResponseOf('validate_user');
            await this.kafkaClient.subscribeToResponseOf('get-booking-data');
            await this.kafkaClient.subscribeToResponseOf('get-booking-data.reply');
            await this.kafkaClient.connect();

            await this.offersClient.subscribeToResponseOf('get-offer-data-by-service');
            await this.offersClient.subscribeToResponseOf('get-offer-data-by-service.reply');
            await this.offersClient.connect();
        } catch (error) {
            console.error('Failed to connect to Kafka', error);
        }
    }


    async getAllBookingsByUserId(user_id: string) {
        try {
            const filterQuery = { user_id };
            const bookings = await this.bookingRepository.find(filterQuery);
    
            if (bookings.length === 0) {
                this.logger.warn(`No bookings found for user with ID: ${user_id}`);
                return [];  
            }
            const salonServiceDataPromises = bookings.map(async (booking) => {
                const salon_id = booking.salon_id; 
                const service_id = booking.service_id; 
    
                try {
                    const salonServiceData = await firstValueFrom(
                        this.kafkaClient.send('get-booking-data', [{ salon_id, service_id }]) 
                    );
    
                    return {
                        booking,            
                        salonServiceData, 
                    };
                } catch (kafkaError) {
                    this.logger.debug('Raw Error Object:', kafkaError);
                    this.logger.error('Error during Kafka call for salon and service data', {
                        message: kafkaError.message || kafkaError.toString(),
                        stack: kafkaError.stack || null,
                        details: JSON.stringify(kafkaError, null, 2),
                    });
                    throw new Error('Error fetching salon and service data from Kafka');
                }
            });
            const result = await Promise.all(salonServiceDataPromises);
            return result;
        } catch (error) {
            this.logger.error(`Error fetching bookings for user ID: ${user_id}`, error.stack);
            throw new Error(`Unable to retrieve bookings for user ID: ${user_id}`);
        }
    }    

    async getBookingByBookingUUID(bookingUUID: string) {
        try {
          
            const filterQuery = { bookingUUID };
            const result = await this.bookingRepository.findOne(filterQuery);
    
            if (!result) {
                this.logger.warn(`No booking found for bookingUUID: ${bookingUUID}`);
                throw new NotFoundException(`No booking found for bookingUUID: ${bookingUUID}`);
            }
    
            const salon_id = result.salon_id; 
            const service_id = result.service_id;  
    
            let salonServiceData: any;
            try {
                salonServiceData = await firstValueFrom(
                    this.kafkaClient.send('get-booking-data', [{ salon_id, service_id }]) 
                );
            } catch (kafkaError) {
                this.logger.debug('Raw Error Object:', kafkaError);
                this.logger.error('Error during Kafka call for salon and service data', {
                    message: kafkaError.message || kafkaError.toString(),
                    stack: kafkaError.stack || null,
                    details: JSON.stringify(kafkaError, null, 2),
                });
                throw new Error('Error fetching salon and service data from Kafka');
            }

            return {
                booking: result,     
                salonServiceData,    
            };
    
        } catch (error) {
            this.logger.error(`Error fetching booking for bookingUUID: ${bookingUUID}`, error.stack);
            throw new Error(`Unable to retrieve booking for bookingUUID: ${bookingUUID}`);
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
                        totalPrice: bookingRequest.totalPrice
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
        let offerData: any;
        let totalPrice: number | null = null;
    
        try {
            offerData = await firstValueFrom(
                this.offersClient.send('get-offer-data-by-service', service_id) 
            );
    
            // Si offerData no contiene datos, lo manejamos
            if (offerData && offerData.length > 0) {
                totalPrice = offerData[0].price;
            } else {
                this.logger.warn(`No offer data returned for service ID ${service_id}. Proceeding without pricing.`);
            }
        } catch (kafkaError) {
            this.logger.debug('Raw Error Object:', kafkaError);
            this.logger.error('Error during Kafka call for salon and service data', {
                message: kafkaError.message || kafkaError.toString(),
                stack: kafkaError.stack || null,
                details: JSON.stringify(kafkaError, null, 2),
            });
            // Continuar sin precio si hay un error con Kafka
            this.logger.warn('Proceeding with booking despite Kafka error.');
        }
    
        const messageBody = {
            bookingUUID,
            user_id,
            service_id,
            salon_id,
            date,
            timeSlot,
            ...(totalPrice !== null && { totalPrice }) // Agregar totalPrice solo si está disponible
        };
    
        try {
            await this.sqsService.sendMessage(messageBody);
            this.logger.log(`Booking request queued for user ${user_id} at salon ${salon_id}`);
    
            return {
                body: { bookingUUID },
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
