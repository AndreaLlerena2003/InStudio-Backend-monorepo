import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsManagerModule } from './payments-manager/payments-manager.module';
import { ConfigModule } from '@nestjs/config';
import { DbManagerPaymentsModule } from '@backend-in-studio/db-manager-payments';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    DbManagerPaymentsModule,
    PaymentsManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
