import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CookieParserMiddleware } from '@nest-middlewares/cookie-parser';
import {KafkaManagerModule} from '@backend-in-studio/kafka-manager';
@Module({
  imports: [
    
  ],
  exports: [], 
})
export class AuthLibModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieParserMiddleware).forRoutes('*');
  }
}
