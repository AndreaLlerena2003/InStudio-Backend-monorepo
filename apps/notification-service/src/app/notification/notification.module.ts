import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationManager } from '../../services/notification-manager';
import { PriorityNotificationManager } from '../../services/priority-notification-manager';
import { DynamooseManagerModule } from '@backend-in-studio/dynamoose-manager';
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { AuthLibModule } from '@backend-in-studio/auth-lib';

@Module({
  imports: [
    ConfigModule,
    DynamooseManagerModule,
    KafkaManagerModule,
    AuthLibModule,
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'notification-client',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: process.env.KAFKA_GROUP_ID,
            allowAutoTopicCreation: true,
          },
        },
      },
      {
        name: 'auth-client',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'client-notification-service',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId: 'backend-instudio-auth-service',
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    PriorityNotificationManager,
    NotificationManager,
    JwtAuthGuard,
  ],
  exports: [
    NotificationService,
    NotificationRepository
  ]
})
export class NotificationModule {}