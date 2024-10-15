import { Module } from '@nestjs/common';
import { DbManagerAuthModule } from '@backend-in-studio/db-manager-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthManagerModule } from './auth-manager/auth-manager.module';
import { ConfigModule , ConfigService} from '@nestjs/config';
import {KafkaManagerModule} from '@backend-in-studio/kafka-manager'
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required()
      }),
      isGlobal: true,
      envFilePath: '.env',
    }),
    DbManagerAuthModule,
    AuthManagerModule,
    KafkaManagerModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
