import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { kafkaConfig } from './app/shared/kafka.config';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.connectMicroservice<MicroserviceOptions>(kafkaConfig);
  const port = process.env.PORT || 3003;
  await app.listen(port);
  await app.startAllMicroservices();
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
