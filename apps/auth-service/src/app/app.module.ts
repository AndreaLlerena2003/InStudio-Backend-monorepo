import { Module } from '@nestjs/common';
import { DbManagerAuthModule } from '@backend-in-studio/db-manager-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthManagerModule } from './auth-manager/auth-manager.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    DbManagerAuthModule,
    AuthManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
