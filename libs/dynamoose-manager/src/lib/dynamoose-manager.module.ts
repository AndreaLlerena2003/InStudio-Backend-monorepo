import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { NotificationSchema } from './models/notification.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DynamooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        aws: {
          accessKeyId: configService.get<string>('ACCESS_KEY_ID'),
          secretAccessKey: configService.get<string>('SECRET_ACCESS_KEY'),
          region: configService.get<string>('AWS_REGION') || 'us-east-2',
        },
      }),
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