import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig: KafkaOptions & { name: string } = {
  name: 'KAFKA_SERVICE',
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'client-notification-service',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'banking-InStudio-notification-service',
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

export const authClientConfig: KafkaOptions & { name: string } = {
  name: 'auth-client',
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'client-auth-service',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'auth-service-group',
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