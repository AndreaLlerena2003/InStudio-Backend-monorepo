import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeConfigService } from './sequelize-config';
import { Sequelize } from 'sequelize-typescript';
import { Admin } from '../../../db-manager-admin/src/lib/models/admin.model';
import { Salon } from '../../../db-manager-admin/src/lib/models/salons.model';
import { Category } from '../../../db-manager-admin/src/lib/models/category.model';
import { Subcategory } from '../../../db-manager-admin/src/lib/models/subcategory.model';
import { Service } from '../../../db-manager-admin/src/lib/models/service.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService, 
    }),
  ],
  exports: [SequelizeModule],
})
export class DbManagerModuleAdmin implements OnModuleInit {
  constructor(private sequelize: Sequelize) {}

  async onModuleInit() {
    this.defineRelationships();
    await this.sequelize.sync({ force: false });
    console.log('Tables synchronized successfully.');
  }

  private defineRelationships() {
    Admin.hasOne(Salon, {
      foreignKey: 'adminId',
      as: 'salons',
    });
    Salon.belongsTo(Admin, {
      foreignKey: 'adminId',
      as: 'admin',
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
