import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'client',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'banking-consumer-group',
      sessionTimeout: 55000,
      heartbeatInterval: 3000,
      retry: {
        retries: 2,
        initialRetryTime: 30,
      },
    },
  },
};