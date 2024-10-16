import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import {KafkaManagerModule} from '@backend-in-studio/kafka-manager';
@Module({
  imports: [
    KafkaManagerModule
  ],
  exports: [KafkaManagerModule], 
})
export class AuthLibModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*'); 
  }
}
