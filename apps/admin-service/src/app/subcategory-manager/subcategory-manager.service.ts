import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { S3Service } from 'libs/s3-manager/src/lib/s3-manager.service';
import { CreateSubcategoryDto } from '../dto/create-subcategory-dto';
import { Subcategory } from '@backend-in-studio/db-manager-admin';

@Injectable()
export class SubcategoryManagerService {
  private readonly logger = new Logger();
  constructor(
    @InjectModel(Subcategory)
    private readonly subcategoryService: typeof Subcategory,
    private readonly kafkaService: KafkaService,
    private readonly s3Service: S3Service,
  ) {
    this.kafkaService.init();
  }

  async createSubcategory(createSubcategoryDto: CreateSubcategoryDto): Promise<Subcategory> {
    try {
      const newSubcategory = await this.subcategoryService.create({
        ...createSubcategoryDto
      });

      this.logger.log(`Subcategory created successfully: ${newSubcategory.id}`);
      return newSubcategory;
    } catch (error) {
      this.logger.error('Error creating salon', error);
      throw new InternalServerErrorException('Failed to create salon');
    }
  }  

  
}
