import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {DbManagerModuleAdmin} from '@backend-in-studio/db-manager-admin';
import { ConfigModule } from '@nestjs/config';
import { AdminManagerModule } from './admin-manager/admin-manager.module';
import {KafkaManagerModule} from '@backend-in-studio/kafka-manager';
import { SubcategoryManagerModule } from './subcategory-manager/subcategory-manager.module';
import { ServiceManagerModule } from './service-manager/service-manager.module';
import { SalonManagerModule } from './salon-manager/salon-manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    DbManagerModuleAdmin,
    KafkaManagerModule,
    AdminManagerModule,
    SubcategoryManagerModule,
    ServiceManagerModule,
    SalonManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
