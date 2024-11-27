<<<<<<< HEAD
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

=======
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
<<<<<<< HEAD
=======
import { MicroserviceOptions} from '@nestjs/microservices';
import { kafkaConfig } from './app/shared/kafka.config';
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
<<<<<<< HEAD
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port);
=======
  app.connectMicroservice<MicroserviceOptions>(kafkaConfig);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port);
  await app.startAllMicroservices();
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
