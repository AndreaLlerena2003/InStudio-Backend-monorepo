import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';

@Injectable()
export class KafkaManagerService implements OnModuleInit {
  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    await this.kafkaService.init();
    console.log('Kafka initialized globally');
  }
}
