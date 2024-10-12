import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {DbManagerModuleAdmin} from '@backend-in-studio/db-manager-admin';
import { ConfigModule } from '@nestjs/config';
import { ServiceManagerModule } from './service-manager/service-manager.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    DbManagerModuleAdmin,
    ServiceManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
