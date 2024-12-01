import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';
import { S3ManagerModule } from '@backend-in-studio/s3-manager';
import { AuthLibModule } from '@backend-in-studio/auth-lib';
import { MongooseManagerModule } from '@backend-in-studio/mongoose-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaManagerService } from './kafka.init.service';
import { Offers, OffersSchema } from '../schemas/offer.schema';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: true,
        validationSchema: Joi.object({
          MONGODB_URI: Joi.string().required(),
          PORT: Joi.number().required(),
        }),
        envFilePath: '.env',
      }),
    KafkaManagerModule,
    S3ManagerModule,
    AuthLibModule,
    MongooseManagerModule,
    MongooseModule.forFeature([
        { name: Offers.name, schema: OffersSchema, collection: 'offers_collection' }
    ]),
    ClientsModule.register([
      {
        name: 'auth-client',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'client-offers-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'backend-InStudio-auth-service-flavio',
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'admin-client',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'client-offers-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'backend-InStudio-admin-service-2',
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
    ConfigModule, 
    MongooseModule

  ],
})
export class SharedModule {}
