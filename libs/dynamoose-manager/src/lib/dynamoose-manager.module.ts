import { Logger, Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { NotificationSchema } from './models/notification.model';

@Module({
  imports: [
    ConfigModule,
    DynamooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        Logger.log('Cargando configuración AWS...');
        Logger.log('AWS_ACCESS_KEY_ID encontrado:', !!configService.get('AWS_ACCESS_KEY_ID'));
      
       return {
        aws: {
          accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
          region: configService.get<string>('AWS_REGION') || 'us-east-2',
        },
      };
      },
      inject: [ConfigService],
    }),
    DynamooseModule.forFeature([
      {
        name: 'Notification',
        schema: NotificationSchema,
        options: {
          throughput: { read: 5, write: 5 },
          create: true,
          waitForActive: true
        },
      },
    ]),
  ],
  exports: [DynamooseModule]
})
export class DynamooseManagerModule {}