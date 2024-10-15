import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka-service';
@Module({
  imports: [
  ],
  controllers: [],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaManagerModule {}
