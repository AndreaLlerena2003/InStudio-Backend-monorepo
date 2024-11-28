import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationManager } from '../../services/notification-manager';
import { PriorityNotificationManager } from '../../services/priority-notification-manager';
import { DynamooseManagerModule } from '@backend-in-studio/dynamoose-manager';
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaConfig, authClientConfig } from '../shared/kafka.config'; // Asegúrate de que la ruta sea correcta

@Module({
  imports: [
    ConfigModule,
    DynamooseManagerModule,
    KafkaManagerModule,
    ScheduleModule.forRoot(),
    HttpModule,
    ClientsModule.register([kafkaConfig, authClientConfig]), // Registra ambos clientes aquí
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