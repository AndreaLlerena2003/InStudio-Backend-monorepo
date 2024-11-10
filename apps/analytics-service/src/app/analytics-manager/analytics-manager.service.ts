import { Injectable } from '@nestjs/common';
import { BookingEventDto } from './dto/booking-event-dto';
import { LambdaService } from 'libs/lambda-manager-analytics/src/lib/lambda.service';
@Injectable()
export class AnalyticsManagerService {
  constructor(private readonly lambdaService: LambdaService) {}
  
  helloWorld() {
    return {
      status: 200,
      message: "Hello World 🙈"
    }
  }

  processBookingEvent(bookingEventDto: BookingEventDto): {} {
    this.lambdaService.invokeLambda(bookingEventDto)
    return {
      processedData: bookingEventDto,
    };
  }
}
