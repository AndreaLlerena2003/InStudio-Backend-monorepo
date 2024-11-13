import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SalonManagerController } from './salon-manager.controller';
import { SalonManagerService } from './salon-manager.service';
import { Service, Salon, Subcategory , Admin} from '@backend-in-studio/db-manager-admin'
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';
import {AuthLibModule} from '@backend-in-studio/auth-lib';
import {S3ManagerModule} from '@backend-in-studio/s3-manager';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [
    SequelizeModule.forFeature([Service, Salon, Subcategory, Admin]), 
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
      }])
  ],
  controllers: [SalonManagerController],
  providers: [SalonManagerService,  JwtAuthGuard],
})
export class SalonManagerModule {}
