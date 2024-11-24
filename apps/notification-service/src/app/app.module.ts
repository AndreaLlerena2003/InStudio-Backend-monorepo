import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DynamooseManagerModule } from '@backend-in-studio/dynamoose-manager';
import { NotificationModule } from './notification/notification.module';
import { DistributedPriorityQueue } from '../services/distributed-priority-queue';
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';
import { AuthLibModule } from '@backend-in-studio/auth-lib'; // Importar el módulo de autenticación si es necesario

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    KafkaManagerModule,
    DynamooseManagerModule,
    NotificationModule,
    AuthLibModule, // Añadir AuthLibModule aquí
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DistributedPriorityQueue
  ],
})
export class AppModule {}
