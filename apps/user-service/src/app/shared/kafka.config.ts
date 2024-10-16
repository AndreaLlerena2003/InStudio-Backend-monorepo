import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'client-user-service',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'banking-InStudio-user-service',
      sessionTimeout: 55000,
      allowAutoTopicCreation: true,
      heartbeatInterval: 3000,
      retry: {
        retries: 2,
        initialRetryTime: 30,
      },
    },
  },
};