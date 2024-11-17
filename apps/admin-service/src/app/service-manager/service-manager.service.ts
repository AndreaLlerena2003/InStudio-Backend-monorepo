import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Salon, Service } from '@backend-in-studio/db-manager-admin';
import { CreateServiceDto } from '../dto/create-service-dto';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { Subcategory } from '@backend-in-studio/db-manager-admin';
import { UpdateServiceDto } from './dto/update-service.dto';
@Injectable()
export class ServiceManagerService {
  private readonly logger = new Logger(ServiceManagerService.name);

  constructor(
    @InjectModel(Service)
    private readonly serviceService: typeof Service,
    @InjectModel(Subcategory)
    private readonly subcategoryService: typeof Subcategory,
    private readonly kafkaService: KafkaService,
  ) {
  }


  async createService(createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      this.logger.log('Attempting to create a new service...');
      const createdService = await this.serviceService.create(createServiceDto);
      this.logger.log(`Service created successfully: ${createdService.id}`);
      return createdService;
    } catch (error) {
      this.logger.error('Error creating service', error.stack);
      throw new InternalServerErrorException('Failed to create service');
    }
  }


  async getServiceById(serviceId: number): Promise<Service> {
    try {
      const service = await this.serviceService.findByPk(serviceId, {
        include: [
          {
            model: Subcategory,
            as: 'subcategory', 
          },
        ],
      });
  
      if (!service) {
        this.logger.warn(`Service with ID ${serviceId} not found.`);
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }
      return service;
    } catch (error) {
      this.logger.error('Error retrieving service by ID', error.stack);
      throw new InternalServerErrorException('Failed to fetch service');
    }
  }

  async getAllServices(): Promise<Service[]> {
    try {
      const services = await this.serviceService.findAll({
        include: [
          {
            model: Subcategory,
            as: 'subcategory', 
          },
        ],
      });
  
      if (services.length === 0) {
        this.logger.warn('No services found.');
        throw new NotFoundException('No services found');
      }
      return services;
    } catch (error) {
      this.logger.error('Error retrieving all services', error.stack);
      throw new InternalServerErrorException('Failed to fetch services');
    }
  }

  async getServicesBySalonId(salon_id: number): Promise<Service[]> {
    try {
      this.logger.log(`Attempting to fetch services for salon_id: ${salon_id}`);
      const services = await this.serviceService.findAll({
        include: [
          {
            model: Salon,
            attributes: [],
            where: { id: salon_id },
            required: true,
          },
          {
            model: Subcategory,
            as: 'subcategory', 
          },
        ],
      });
  
      if (services.length === 0) {
        this.logger.warn(`No services found for salon_id: ${salon_id}`);
        throw new NotFoundException('No services found for this salon');
      }
  
      return services;
    } catch (error) {
      this.logger.error('Error retrieving services for salon', error.stack);
      throw new InternalServerErrorException('Failed to fetch services for salon');
    }
  }


  async editService(updateServiceDto: UpdateServiceDto): Promise<Service> {
    try {
      const service = await this.serviceService.findByPk(updateServiceDto.serviceId, {
        include: [
          {
            model: Subcategory,
            as: 'subcategory',
            attributes: [], 
          },
        ],
      });
  
      if (!service) {
        this.logger.warn(`Service with ID ${updateServiceDto.serviceId} not found.`);
        throw new NotFoundException(`Service with ID ${updateServiceDto.serviceId} not found`);
      }
  
      if (updateServiceDto.price !== undefined) {
        service.price = updateServiceDto.price;
      }
  
      if (updateServiceDto.subcategoryId !== undefined) {
        const subcategory = await this.subcategoryService.findByPk(updateServiceDto.subcategoryId);
  
        if (!subcategory) {
          this.logger.warn(`Subcategory with ID ${updateServiceDto.subcategoryId} not found.`);
          throw new NotFoundException(`Subcategory with ID ${updateServiceDto.subcategoryId} not found`);
        }
        service.subcategoryId = updateServiceDto.subcategoryId;
      }
      await service.save();
      this.logger.log(`Service with ID ${updateServiceDto.serviceId} updated successfully.`);
      return service;
    } catch (error) {
      this.logger.error('Error updating service', error.stack);
      throw new InternalServerErrorException('Failed to update service');
    }
  }
  
}
