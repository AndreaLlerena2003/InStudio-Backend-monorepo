import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalyticsManagerModule } from './analytics-manager/analytics-manager.module';
import { DbManagerAnalyticsModule } from '@backend-in-studio/db-manager-analytics';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    DbManagerAnalyticsModule,
    AnalyticsManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
