import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Service , Salon, Subcategory} from '@backend-in-studio/sequelize-manager';
import { CreateServiceDto } from './dto/create-service-dto'; 

@Injectable()
export class ServiceManagerService {

  constructor(
    @InjectModel(Service)
    private readonly serviceModel: typeof Service,
    @InjectModel(Subcategory)
    private readonly subcategoryModel: typeof Subcategory,
    @InjectModel(Salon)
    private readonly salonModel: typeof Salon
  ) {}

  async createService(createServiceDto: CreateServiceDto): Promise<Service> {
    const { subcategoryId, salon_id } = createServiceDto;
    const subcategory = await this.subcategoryModel.findByPk(subcategoryId);
    if (!subcategory) {
      throw new NotFoundException(`Subcategory with ID ${subcategoryId} not found`);
    }
    const salon = await this.salonModel.findByPk(salon_id);
    if (!salon) {
      throw new NotFoundException(`Salon with ID ${salon_id} not found`);
    }
    return this.serviceModel.create(createServiceDto);
  }

}
