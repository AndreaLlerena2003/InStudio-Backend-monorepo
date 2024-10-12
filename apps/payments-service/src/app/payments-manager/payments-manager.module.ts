import { Module } from '@nestjs/common';
import { PaymentsManagerService } from './payments-manager.service';
import { SequelizeModule } from '@nestjs/sequelize';
import {Payment} from '@backend-in-studio/db-manager-payments';
import { PaymentsManagerController } from './payments-manager.controller';
@Module({
  imports: [
    SequelizeModule.forFeature([Payment]), 
  ],
  providers: [PaymentsManagerService],
  controllers: [PaymentsManagerController]
})
export class PaymentsManagerModule {}
