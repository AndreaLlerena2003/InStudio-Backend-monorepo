import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';
import { S3ManagerModule } from '@backend-in-studio/s3-manager';
import { AuthLibModule } from '@backend-in-studio/auth-lib';
import { SequelizeModule } from '@nestjs/sequelize';
import { Service, Salon, Subcategory, Admin, Category } from '@backend-in-studio/db-manager-admin';
import { KafkaManagerService } from './kafka.init.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Service, Salon, Subcategory, Admin, Category]), 
    KafkaManagerModule,
    S3ManagerModule,
    AuthLibModule,
    ClientsModule.register([
      {
        name: 'auth-client',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'client-admin-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'backend-InStudio-auth-service',
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  providers: [KafkaManagerService],
  exports: [
    KafkaManagerService,
    KafkaManagerModule,
    S3ManagerModule,
    AuthLibModule,
    ClientsModule, 
    SequelizeModule
  ],
})
export class SharedModule {}
