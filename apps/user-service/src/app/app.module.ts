import { Module } from '@nestjs/common';
import { DbManagerUserModule } from '@backend-in-studio/db-manager-user';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserManagerModule } from './user-manager/user-manager.module';
import { ConfigModule } from '@nestjs/config';
import {KafkaManagerModule} from '@backend-in-studio/kafka-manager';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    DbManagerUserModule,
    KafkaManagerModule,
    UserManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
