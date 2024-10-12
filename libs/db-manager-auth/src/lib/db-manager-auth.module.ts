import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeConfigService } from './sequelize-config';
import { Sequelize } from 'sequelize-typescript';
import { AuthTokens } from './models/auth.tokens';
import { AuthUsers } from './models/auth.users';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService, 
    }),
  ],
  exports: [SequelizeModule],
})
export class DbManagerAuthModule implements OnModuleInit {
  constructor(private sequelize: Sequelize) {}

  async onModuleInit() {
    this.defineRelationships();
    await this.sequelize.sync({ force: true });
    console.log('Tables synchronized successfully.');
  }

  private defineRelationships() {
    AuthUsers.hasMany(AuthTokens, {
      foreignKey: 'auth_user_id',
      as: 'authTokens',
    });
    AuthTokens.belongsTo(AuthUsers, {
      foreignKey: 'auth_user_id',
      as: 'authUsers',
    });
  }
}
