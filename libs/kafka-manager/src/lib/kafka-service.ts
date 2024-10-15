import { Injectable, Logger } from '@nestjs/common';
import { KAFKA_BROKER } from './kafka-broker';

@Injectable()
export class KafkaService {
  private producer: any;
  private logger = new Logger(KafkaService.name);
  constructor() { }
  async init() {
    this.producer = KAFKA_BROKER.producer();
    await this.producer.connect();
  }

  async sendEvent(event: any, topic: any) {
    try {
      this.logger.log(
        `[KafkaService] sendEvent ${JSON.stringify(event)}, ${topic}`,
      );
      const message = {
        value: Buffer.from(JSON.stringify(event)),
      };
      await this.producer.send({
        topic: topic,
        messages: [message],
      });
    } catch (error) {
      this.logger.error('[KafkaService] sendEvent', JSON.stringify(error));
      throw error;
    }
  }
  
  async sendEventBulk(events: any[], topic: any) {
    try {
      this.logger.log(
        `[KafkaService] sendEvent ${JSON.stringify(events)}, ${topic}`,
      );
      const messages = events.map((event: any) => ({
        value: Buffer.from(JSON.stringify(event)),
      }));
      await this.producer.send({
        topic: topic,
        messages: messages,
      });
    } catch (error) {
      this.logger.error('[KafkaService] sendEvent', JSON.stringify(error));
      throw error;
    }
  }
}