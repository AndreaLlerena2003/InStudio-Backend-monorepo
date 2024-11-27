import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseManagerModule } from '@backend-in-studio/mongoose-manager';
<<<<<<< HEAD
import { PendingModule } from './pending-booking/pending.module';

=======
import { AvailabilityModule } from './availability-manager/availability.module';
import { BookingModule } from './boooking-manager/booking.module';
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
<<<<<<< HEAD
    MongooseManagerModule,
    PendingModule
=======
    AvailabilityModule,
    BookingModule
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
