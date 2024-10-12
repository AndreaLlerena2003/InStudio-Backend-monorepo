import { Module , OnModuleInit} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeConfigService } from './sequelize-config';
import { Sequelize } from 'sequelize-typescript';
import { Analytics } from './models/analytics.model';
import { Booking_Status } from './models/booking.status.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService, 
    }),
  ],
  exports: [SequelizeModule],
})
export class DbManagerAnalyticsModule {
  constructor(private sequelize: Sequelize) {}

  async onModuleInit() {
    this.defineRelationships();
    await this.sequelize.sync({ force: true });
    console.log('Tables synchronized successfully.');
  }

  private defineRelationships() {
    Booking_Status.hasMany(Analytics, {
      foreignKey: 'booking_status_id',
      as: 'analytics',
    });
    Analytics.belongsTo(Booking_Status, {
      foreignKey: 'booking_status_id',
      as: 'booking_status',
    });
  }
}
