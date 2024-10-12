import { Module } from '@nestjs/common';
import { UserManagerService } from './user-manager.service';
import { UserManagerController } from './user-manager.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import {User,City,District,Region} from '@backend-in-studio/db-manager-user';

@Module({
  imports: [
    SequelizeModule.forFeature([User,City,District,Region]), 
  ],
  providers: [UserManagerService],
  controllers: [UserManagerController]
})
export class UserManagerModule {}
