import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseManagerModule } from '@backend-in-studio/mongoose-manager';
import { AvailabilityModule } from './availability-manager/availability.module';
import { BookingModule } from './boooking-manager/booking.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    AvailabilityModule,
    BookingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
