import { Module } from '@nestjs/common';
import { SearchManagerService } from './search-manager.service';
import { SearchManagerController } from './search-manager.controller';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { SharedModule } from '../shared/shared.module';
@Module({
  imports: [
   SharedModule
  ],
  controllers: [SearchManagerController],
  providers: [SearchManagerService,  JwtAuthGuard],
})
export class SearchManagerModule {}
