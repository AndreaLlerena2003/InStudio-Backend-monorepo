import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { MongooseManagerModule } from '@backend-in-studio/mongoose-manager';
import { BookingRepository } from './booking.repository';
import { BookingService } from './booking.service';
import { AvailabilityService } from '../availability-manager/availability.service';
import { BookingController } from './booking.controller';
import { SharedModule } from '../shared/shared.module';
import { AvailabilityRepository } from '../availability-manager/availability.repository';
@Module({
  imports: [
    SharedModule
  ],
  controllers: [ BookingController ],
  providers: [AvailabilityService, BookingRepository, BookingService, AvailabilityRepository],
})
export class BookingModule {}
