import { Module } from '@nestjs/common';
import { PaymentsManagerService } from './payments-manager.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentsManagerController } from './payments-manager.controller';
@Module({
  imports: [, 
  ],
  providers: [PaymentsManagerService],
  controllers: [PaymentsManagerController]
})
export class PaymentsManagerModule {}
