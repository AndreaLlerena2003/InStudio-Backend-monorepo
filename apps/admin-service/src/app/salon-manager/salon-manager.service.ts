import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Salon } from '@backend-in-studio/db-manager-admin';
import { CreateSalonDto } from '../dto/create-salon-dto';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { S3Service } from 'libs/s3-manager/src/lib/s3-manager.service';

@Injectable()
export class SalonManagerService {
  private readonly logger = new Logger();
  constructor(
    @InjectModel(Salon)
    private readonly salonService: typeof Salon,
    private readonly kafkaService: KafkaService,
    private readonly s3Service: S3Service,
  ) {
    this.kafkaService.init();
  }

  async createSalon(createSalonDto: CreateSalonDto): Promise<Salon> {
    try {
      const newSalon = await this.salonService.create({
        ...createSalonDto
      });

      this.logger.log(`Salon created successfully: ${newSalon.id}`);
      return newSalon;
    } catch (error) {
      this.logger.error('Error creating salon', error);
      throw new InternalServerErrorException('Failed to create salon');
    }
  }  

}
