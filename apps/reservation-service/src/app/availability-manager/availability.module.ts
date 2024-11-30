import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { MongooseManagerModule } from '@backend-in-studio/mongoose-manager';
import { AvailabilityRepository } from './availability.repository';
import { Availability, AvailabilitySchema } from '../schemas/availability.schema';
import { AvailabilityService } from './availability.service';
import { UpdateAvailabilityController } from './usecases/update-availability.controller';
import { SharedModule } from '../shared/shared.module';
import { CheckAvailabilityController } from './usecases/fetch-availible-dates.controller';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    SharedModule,
    ScheduleModule.forRoot()
  ],
  controllers: [UpdateAvailabilityController, CheckAvailabilityController],
  providers: [AvailabilityService, AvailabilityRepository,JwtAuthGuard],
})
export class AvailabilityModule {}
