import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@backend-in-studio/mongoose-manager';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Booking } from '../schemas/booking.schema';

@Injectable()
export class PendingBookingRepository extends AbstractRepository<Booking> {
  protected readonly logger = new Logger(PendingBookingRepository.name);

  constructor(
    @InjectModel(Booking.name) bookingModel: Model<Booking>,
    @InjectConnection() connection: Connection,
  ) {
    super(bookingModel, connection);
  }
}
