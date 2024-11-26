import { Module } from '@nestjs/common';
import { SQSModule } from '../infraestructure/sqs.module';
import { BookingRepository } from './booking.repository';
import { BookingService } from './booking.service';
import { AvailabilityService } from '../availability-manager/availability.service';
import { BookingController } from './booking.controller';
import { SharedModule } from '../shared/shared.module';
import { AvailabilityRepository } from '../availability-manager/availability.repository';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    SharedModule,
    SQSModule
  ],
  controllers: [ BookingController ],
  providers: [AvailabilityService, BookingRepository, BookingService, AvailabilityRepository, JwtAuthGuard],
})
export class BookingModule {}
