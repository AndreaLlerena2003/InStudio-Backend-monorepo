import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'client-auth-service',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'banking-InStudio-auth-service',
      allowAutoTopicCreation: true,
      sessionTimeout: 55000,
      heartbeatInterval: 3000,
      retry: {
        retries: 2,
        initialRetryTime: 30,
      },
    },
  },
};