<<<<<<< HEAD
<<<<<<< HEAD
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

=======
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
=======
>>>>>>> origin/develop
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
<<<<<<< HEAD
<<<<<<< HEAD
=======
import { MicroserviceOptions} from '@nestjs/microservices';
import { kafkaConfig } from './app/shared/kafka.config';
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
=======
import { MicroserviceOptions} from '@nestjs/microservices';
import { kafkaConfig } from './app/shared/kafka.config';
>>>>>>> origin/develop

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
<<<<<<< HEAD
<<<<<<< HEAD
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port);
=======
=======
  app.enableCors({
    origin: true,
    credentials: true,
  });
>>>>>>> origin/develop
  app.connectMicroservice<MicroserviceOptions>(kafkaConfig);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port);
  await app.startAllMicroservices();
<<<<<<< HEAD
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
=======
>>>>>>> origin/develop
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
