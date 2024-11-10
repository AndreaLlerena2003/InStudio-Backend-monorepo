import { Module } from '@nestjs/common';
import { AnalyticsManagerController } from './analytics-manager.controller';
import { AnalyticsManagerService } from './analytics-manager.service';
import { LambdaManagerAnalyticsModule } from '@backend-in-studio/lambda-manager-analytics';

@Module({
  imports: [
    LambdaManagerAnalyticsModule
  ],
  controllers: [AnalyticsManagerController],
  providers: [AnalyticsManagerService]
})
export class AnalyticsManagerModule {}
