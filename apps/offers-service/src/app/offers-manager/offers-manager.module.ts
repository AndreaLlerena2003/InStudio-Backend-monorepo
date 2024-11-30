import { Module } from '@nestjs/common';
import { OffersService } from './offers-manager.service';
import { OffersController } from './offers-manager.controller';
import { SharedModule } from '../shared/shared.module';
import { OffersRepository } from './offers-manager.repository';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    SharedModule,
  ],
  controllers: [ OffersController ],
  providers: [OffersService, OffersRepository, OffersService, JwtAuthGuard],
})
export class OffersManagerModule {}
