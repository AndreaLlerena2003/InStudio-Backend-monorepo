import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Booking } from '../schemas/booking.schema';
import { Injectable , Logger} from '@nestjs/common';
import { AbstractRepository } from '@backend-in-studio/mongoose-manager';


@Injectable()
export class BookingRepository extends AbstractRepository<Booking> {
  protected readonly logger = new Logger(BookingRepository.name);
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectConnection() connection: Connection,
  ) {
    super(bookingModel,connection);
  }

}
