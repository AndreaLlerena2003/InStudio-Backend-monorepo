import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeConfigService } from './sequelize-config';
import { Sequelize } from 'sequelize-typescript';
import { User } from './models/user.model';
import { District } from './models/district.model';
import { Region } from './models/region.model';
import { City } from './models/city.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService, 
    }),
  ],
  exports: [SequelizeModule],
})
export class DbManagerUserModule implements OnModuleInit {
  constructor(private sequelize: Sequelize) {}

  async onModuleInit() {
    this.defineRelationships();
    try {
      await this.sequelize.sync({ force: true });
      console.log('Tables synchronized successfully.');
    } catch (error) {
      console.error('Error synchronizing tables:', error);
    }
  }

  private defineRelationships() {
    Region.hasMany(City, {
      foreignKey: 'regionId',
      as: 'cities',
    });
    City.belongsTo(Region, {
      foreignKey: 'regionId',
      as: 'regions',
    });
    City.hasMany(District, {
      foreignKey: 'cityId',
      as: 'districts',
    });
    District.belongsTo(City, {
      foreignKey: 'cityId',
      as: 'cities',
    });
    District.hasMany(User, {
      foreignKey: 'districtId',
      as: 'users',
    });
    User.belongsTo(District, {
      foreignKey: 'districtId',
      as: 'districts',
    });
  }
}
