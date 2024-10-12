import { SequelizeOptions } from 'sequelize-typescript';
import { AuthTokens } from './models/auth.tokens';
import { AuthUsers } from './models/auth.users';
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
      models: [AuthTokens, AuthUsers],
    };
  }
}