import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Offers, OfferType } from '../schemas/offer.schema';
import { Injectable , Logger} from '@nestjs/common';
import { AbstractRepository } from '@backend-in-studio/mongoose-manager';


@Injectable()
export class OffersRepository extends AbstractRepository<Offers> {
  protected readonly logger = new Logger(OffersRepository.name);
  constructor(
    @InjectModel(Offers.name) private offersModel: Model<Offers>,
    @InjectConnection() connection: Connection,
  ) {
    super(offersModel,connection);
  }

}
