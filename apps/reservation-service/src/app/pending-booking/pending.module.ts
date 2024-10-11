import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { MongooseManagerModule } from '@backend-in-studio/mongoose-manager';
import { BookingPendingController } from './pending.controller';
import { PendingBookingService } from './pending.service';
import { PendingBookingRepository } from './pending.repository';
import { Booking, BookingSchema } from '../schemas/booking.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: '.env',
    }),
    MongooseManagerModule,
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema , collection: 'pending-booking'}]),
  ],
  controllers: [BookingPendingController],
  providers: [PendingBookingService, PendingBookingRepository],
})
export class PendingModule {}
