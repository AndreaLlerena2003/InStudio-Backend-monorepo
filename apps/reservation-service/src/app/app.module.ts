import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseManagerModule } from '@backend-in-studio/mongoose-manager';
import { PendingModule } from './pending-booking/pending.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    MongooseManagerModule,
    PendingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
