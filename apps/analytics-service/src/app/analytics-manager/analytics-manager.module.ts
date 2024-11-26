import { Module } from '@nestjs/common';
import { AnalyticsManagerController } from './analytics-manager.controller';
import { AnalyticsManagerService } from './analytics-manager.service';
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';
import { LambdaManagerAnalyticsModule } from '@backend-in-studio/lambda-manager-analytics';
import { S3ManagerModule } from '@backend-in-studio/s3-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    KafkaManagerModule,
    LambdaManagerAnalyticsModule,
    S3ManagerModule,
    ClientsModule.register([
      {
        name: 'ADMIN_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'client-analytics-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'banking-InStudio-analytics-service-group',
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [AnalyticsManagerController],
  providers: [AnalyticsManagerService],
})
export class AnalyticsManagerModule {}
