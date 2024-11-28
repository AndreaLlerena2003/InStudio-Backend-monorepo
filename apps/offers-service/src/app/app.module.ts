import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseManagerModule } from '@backend-in-studio/mongoose-manager';
import { OffersManagerModule } from './offers-manager/offers-manager.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    OffersManagerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
