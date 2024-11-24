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
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule,
    DynamooseManagerModule,
    KafkaManagerModule,
    ScheduleModule.forRoot(),
    ClientsModule.register([
      
      {
        name: 'auth-client',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'auth',
            brokers: ['localhost:9092'], // Reemplaza con tus brokers Kafka
          },
          consumer: {
            groupId: 'notification-service-consumer', // Reemplaza con tu groupId
          },
        },
      },
    ])
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationManager,
    PriorityNotificationManager,
    JwtAuthGuard,
  ],
  exports: [
    NotificationService,
    NotificationRepository,
    PriorityNotificationManager  // Exportar el Manager
  ]
})
export class NotificationModule {}