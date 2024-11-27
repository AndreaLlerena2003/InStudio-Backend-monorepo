import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { kafkaConfig } from './app/shared/kafka.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
<<<<<<< HEAD
  app.connectMicroservice<MicroserviceOptions>(kafkaConfig);
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['content-type', '*'],
    credentials: true,
  });
  const port = process.env.PORT || 3000;
  await app.startAllMicroservices();

  await app.listen(port);
=======
  
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  app.connectMicroservice<MicroserviceOptions>(kafkaConfig);
  await app.startAllMicroservices();
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

<<<<<<< HEAD
bootstrap();
=======
bootstrap();
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
