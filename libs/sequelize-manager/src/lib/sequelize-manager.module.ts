import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeConfigService } from './sequelize-config';
import { Sequelize } from 'sequelize-typescript';
import { User } from './models/user.model';
import { Salon } from './models/salons.model';
import { Category } from './models/category.model';
import { Subcategory } from './models/subcategory.model';
import { Service } from './models/service.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService, 
    }),
  ],
  exports: [SequelizeModule],
})
export class SequelizeManagerModule implements OnModuleInit {
  constructor(private sequelize: Sequelize) {}

  async onModuleInit() {
    this.defineRelationships();
    await this.sequelize.sync({ force: false });
    console.log('Tables synchronized successfully.');
  }

  private defineRelationships() {
    User.hasOne(Salon, {
      foreignKey: 'userId',
      as: 'salons',
    });
    Salon.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user',
    });

    Category.hasMany(Subcategory, {
      foreignKey: 'categoryId',
      as: 'subcategories',
    });
    Subcategory.belongsTo(Category, {
      foreignKey: 'categoryId',
      as: 'category',
    });

    Subcategory.hasMany(Service, {
      foreignKey: 'subcategoryId',
      as: 'services',
    });
    Service.belongsTo(Subcategory, {
      foreignKey: 'subcategoryId',
      as: 'subcategory',
    });

    Salon.hasMany(Service, {
      foreignKey: 'salon_id',
      as: 'services',
    });
    Service.belongsTo(Salon, {
      foreignKey: 'salon_id',
      as: 'salons',
    });
  }
}
