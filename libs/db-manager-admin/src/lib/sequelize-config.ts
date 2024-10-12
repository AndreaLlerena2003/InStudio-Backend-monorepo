import { SequelizeOptions } from 'sequelize-typescript';
import { Admin } from '../../../db-manager-admin/src/lib/models/admin.model';
import { Salon } from '../../../db-manager-admin/src/lib/models/salons.model';
import { Category } from '../../../db-manager-admin/src/lib/models/category.model';
import { Subcategory } from '../../../db-manager-admin/src/lib/models/subcategory.model';
import { Service } from '../../../db-manager-admin/src/lib/models/service.model';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SequelizeConfigService {
  constructor(private configService: ConfigService) {}

  createSequelizeOptions(): SequelizeOptions {
    return {
      dialect: this.configService.get<string>('DB_DIALECT') as 'postgres',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      logging: true,
      models: [Admin, Salon, Category, Subcategory, Service],
    };
  }
}