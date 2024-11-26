import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalyticsManagerModule } from './analytics-manager/analytics-manager.module';
import { LambdaManagerAnalyticsModule } from '@backend-in-studio/lambda-manager-analytics'
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';
// import { DbManagerAnalyticsModule } from '@backend-in-studio/db-manager-analytics';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    KafkaManagerModule,
    // DbManagerAnalyticsModule,
    LambdaManagerAnalyticsModule,
    AnalyticsManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
