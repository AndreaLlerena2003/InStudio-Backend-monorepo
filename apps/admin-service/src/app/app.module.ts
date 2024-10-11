import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {SequelizeManagerModule} from '@backend-in-studio/sequelize-manager';
import { ConfigModule } from '@nestjs/config';
import { ServiceManagerModule } from './service-manager/service-manager.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    SequelizeManagerModule,
    ServiceManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
