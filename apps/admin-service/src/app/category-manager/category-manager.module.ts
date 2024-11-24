import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoryManagerService } from './category-manager.service';
import { CategoryManagerController } from './category-manager.controller';
import { Service, Salon, Subcategory , Admin, Category} from '@backend-in-studio/db-manager-admin'
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';
import {AuthLibModule} from '@backend-in-studio/auth-lib';
import {S3ManagerModule} from '@backend-in-studio/s3-manager';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule
  ],
  controllers: [CategoryManagerController],
  providers: [CategoryManagerService,  JwtAuthGuard],
})
export class CategoryManagerModule {}
