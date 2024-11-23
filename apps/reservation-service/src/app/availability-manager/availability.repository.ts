import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Availability } from '../schemas/availability.schema';
import { Injectable , Logger} from '@nestjs/common';
import { AbstractRepository } from '@backend-in-studio/mongoose-manager';


@Injectable()
export class AvailabilityRepository extends AbstractRepository<Availability> {
  protected readonly logger = new Logger(AvailabilityRepository.name);
  constructor(
    @InjectModel(Availability.name) private availabilityModel: Model<Availability>,
    @InjectConnection() connection: Connection,
  ) {
    super(availabilityModel,connection);
  }

}
