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
<<<<<<< HEAD
  app.connectMicroservice<MicroserviceOptions>(kafkaConfig);
  const port = process.env.PORT || 3001;
  await app.listen(port);
  await app.startAllMicroservices();
=======
=======
>>>>>>> origin/develop
  
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>(kafkaConfig);
  await app.startAllMicroservices();
  const port = process.env.PORT || 3001;
  await app.listen(port);
<<<<<<< HEAD
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
=======
>>>>>>> origin/develop

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

<<<<<<< HEAD
<<<<<<< HEAD

bootstrap();
=======
bootstrap();
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
=======
bootstrap();
>>>>>>> origin/develop
