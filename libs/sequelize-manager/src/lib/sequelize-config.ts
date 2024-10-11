import { SequelizeOptions } from 'sequelize-typescript';
import { User } from './models/user.model';
import { Salon } from './models/salons.model';
import { Category } from './models/category.model';
import { Subcategory } from './models/subcategory.model';
import { Service } from './models/service.model';
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
      models: [User, Salon, Category, Subcategory, Service],
    };
  }
}