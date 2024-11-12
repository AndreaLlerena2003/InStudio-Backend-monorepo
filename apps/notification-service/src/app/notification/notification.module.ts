import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { PriorityNotificationManager } from '../../services/priority-notification-manager';
import { DynamooseManagerModule } from '@backend-in-studio/dynamoose-manager';
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [
    ConfigModule.forRoot(),
    DynamooseManagerModule,
    KafkaManagerModule,
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
      }])
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