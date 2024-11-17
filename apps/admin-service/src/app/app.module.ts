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
import { CategoryManagerModule } from './category-manager/category-manager.module';
import { SharedModule } from './shared/shared.module';
import { SearchManagerModule } from './search-manager/search-manager.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    SharedModule,
    SearchManagerModule,
    DbManagerModuleAdmin,
    KafkaManagerModule,
    AdminManagerModule,
    SubcategoryManagerModule,
    ServiceManagerModule,
    CategoryManagerModule,
    SalonManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
