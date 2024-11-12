import { Module } from '@nestjs/common';
import { AnalyticsManagerController } from './analytics-manager.controller';
import { AnalyticsManagerService } from './analytics-manager.service';
import { LambdaManagerAnalyticsModule } from '@backend-in-studio/lambda-manager-analytics';
import {S3ManagerModule} from '@backend-in-studio/s3-manager';
@Module({
  imports: [
    LambdaManagerAnalyticsModule,
    S3ManagerModule
  ],
  controllers: [AnalyticsManagerController],
  providers: [AnalyticsManagerService]
})
export class AnalyticsManagerModule {}
