import { Module } from '@nestjs/common';
import { AuthManagerService } from './auth-manager.service';
import { AuthManagerController } from './auth-manager.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthTokens, AuthUsers } from '@backend-in-studio/db-manager-auth';
@Module({
  imports: [
    SequelizeModule.forFeature([AuthTokens, AuthUsers]), 
  ],
  providers: [AuthManagerService],
  controllers: [AuthManagerController]
})
export class AuthManagerModule {}
