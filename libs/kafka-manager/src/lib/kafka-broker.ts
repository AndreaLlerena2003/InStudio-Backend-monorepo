import { Kafka } from 'kafkajs';

export const KAFKA_BROKER = new Kafka({
  clientId: 'client',
  brokers: ['localhost:9092'],
});