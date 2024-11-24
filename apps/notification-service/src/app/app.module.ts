import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DynamooseManagerModule } from '@backend-in-studio/dynamoose-manager';
import { NotificationModule } from './notification/notification.module';
import { NotificationManager } from '../services/notification-manager';
import { PriorityNotificationManager } from '../services/priority-notification-manager';
import { DistributedPriorityQueue } from '../services/distributed-priority-queue';
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    KafkaManagerModule,
    DynamooseManagerModule,
    NotificationModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    NotificationManager,
    PriorityNotificationManager,
    DistributedPriorityQueue
  ],
})
export class AppModule {}
