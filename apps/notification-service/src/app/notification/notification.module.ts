import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaConfig } from '../shared/kafka.config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { PriorityNotificationManager } from '../../services/priority-notification-manager';
import { DynamooseManagerModule } from '@backend-in-studio/dynamoose-manager';
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        ...kafkaConfig,
      },
    ]),
    DynamooseManagerModule,
    KafkaManagerModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    PriorityNotificationManager
  ],
  exports: [NotificationService,
    NotificationRepository
  ]
})
export class NotificationModule {}