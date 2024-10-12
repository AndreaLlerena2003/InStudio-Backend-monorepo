import { SequelizeModule } from '@nestjs/sequelize';
import { Module, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeConfigService } from './sequelize-config';
import { Payment } from './models/payment.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService, 
    }),
  ],
  exports: [SequelizeModule],
})
export class DbManagerPaymentsModule implements OnModuleInit{
  constructor(private sequelize: Sequelize) {}
  async onModuleInit() {
    await this.sequelize.sync({ force: true });
    console.log('Tables synchronized successfully.');
  }
}
