import { SequelizeOptions } from 'sequelize-typescript';
import { User } from './models/user.model';
import { District } from './models/district.model';
import { Region } from './models/region.model';
import { City } from './models/city.model';
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
      models: [User, District, Region, City],
    };
  }
}