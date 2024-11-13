import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Salon, Admin, Service } from '@backend-in-studio/db-manager-admin';
import { CreateServiceDto } from '../dto/create-service-dto';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { S3Service } from 'libs/s3-manager/src/lib/s3-manager.service';

@Injectable()
export class ServiceManagerService {
  private readonly logger = new Logger();
  constructor(
    @InjectModel(Salon)
    private readonly serviceService: typeof Service,
    private readonly kafkaService: KafkaService,

  ) {
    this.kafkaService.init();
  }

  async createService(createServiceDto: CreateServiceDto): Promise<Service> {
    const createdService = await this.serviceService.create(createServiceDto);
    return createdService;
  }

  
}
