import { Module } from '@nestjs/common';
import { AnalyticsManagerController } from './analytics-manager.controller';
import { AnalyticsManagerService } from './analytics-manager.service';
import {Analytics} from '@backend-in-studio/db-manager-analytics';
import { Booking_Status } from '@backend-in-studio/db-manager-analytics';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forFeature([Analytics,Booking_Status]), 
  ],
  controllers: [AnalyticsManagerController],
  providers: [AnalyticsManagerService]
})
export class AnalyticsManagerModule {}
