import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LambdaConfigService } from './lambda-config';
import { LambdaService } from './lambda.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [LambdaService, LambdaConfigService],
  exports: [LambdaService],
})
export class LambdaManagerAnalyticsModule {

}
