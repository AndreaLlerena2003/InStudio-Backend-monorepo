
import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { NotificationManager } from './services/notification-manager';
import { NotificationSchema } from '@backend-in-studio/dynamoose-manager';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    DynamooseModule.forRoot({
      aws: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        region: 'us-east-2'
      }
    }),
    DynamooseModule.forFeature([
      {
        name: 'Notification',
        schema: NotificationSchema,
      },
    ]),
  ],
  providers: [NotificationManager],
  exports: [NotificationManager],
})
export class NotificationModule {}