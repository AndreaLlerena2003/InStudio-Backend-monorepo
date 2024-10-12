import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServiceManagerService } from './service-manager.service';
import { ServiceManagerController } from './service-manager.controller';
import { Service, Salon, Subcategory } from '@backend-in-studio/db-manager-admin'

@Module({
  imports: [
    SequelizeModule.forFeature([Service, Salon, Subcategory]), 
  ],
  controllers: [ServiceManagerController],
  providers: [ServiceManagerService],
})
export class ServiceManagerModule {}
