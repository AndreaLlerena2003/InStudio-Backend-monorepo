import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SubcategoryManagerService } from './subcategory-manager.service';
import { SubcategoryManagerController } from './subcategory-manager.controller';
import { Service, Salon, Subcategory , Admin} from '@backend-in-studio/db-manager-admin'
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
  controllers: [SubcategoryManagerController],
  providers: [SubcategoryManagerService,  JwtAuthGuard],
})
export class SubcategoryManagerModule {}
