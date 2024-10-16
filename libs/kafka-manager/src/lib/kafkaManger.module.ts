import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaService } from './kafka-service';

export const KAFKA_SERVICE = 'KAFKA_SERVICE';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: KAFKA_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const clientId = configService.get<string>('KAFKA_CLIENT_ID') || 'default-client';
          const groupId = configService.get<string>('KAFKA_GROUP_ID') || 'default-group';
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: clientId,
                brokers: ['localhost:9092'],
              },
              consumer: {
                groupId: groupId,
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [],
  providers: [
    KafkaService,
    {
      provide: KAFKA_SERVICE, 
      useValue: KAFKA_SERVICE,
    },
  ],
  exports: [KafkaService, KAFKA_SERVICE],
})
export class KafkaManagerModule {}
