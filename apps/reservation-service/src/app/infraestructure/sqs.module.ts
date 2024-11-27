import { Module } from '@nestjs/common';
import {SQSService} from '../infraestructure/sqs.service';

@Module({
  providers: [SQSService],
  exports: [SQSService]
})
export class SQSModule {}
