import { Controller, Post, Body, Get, HttpCode, HttpStatus, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateServiceDto } from '../dto/create-service-dto';
import { Service } from '@backend-in-studio/db-manager-admin';
import { ServiceManagerService } from './service-manager.service';
import { UpdateServiceDto } from './dto/update-service.dto';
class GetServicesBySalonDto {
  salon_id: number;
}

@Controller('service-manager')
export class ServiceController {
  
  private readonly logger = new Logger();
  constructor(private readonly serviceManagerService: ServiceManagerService) {}

 
  @Post('create-service')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      return await this.serviceManagerService.createService(createServiceDto);
    } catch (error) {
      throw new Error('Failed to create service');
    }
  }

 
  @Post('get-by-id')
  async getServiceById(@Body() getServiceDto: { service_id: number }): Promise<Service> {
    const service = await this.serviceManagerService.getServiceById(getServiceDto.service_id);
    if (!service) {
      throw new NotFoundException(`Service with ID ${getServiceDto.service_id} not found`);
    }
    return service;
  }


  @Get('get-all')
  async getAllServices(): Promise<Service[]> {
    return await this.serviceManagerService.getAllServices();
  }

  @Post('get-services-by-salon')
  async getServicesBySalonId(@Body() body: GetServicesBySalonDto): Promise<Service[]> {
    const { salon_id } = body;

    try {
      const services = await this.serviceManagerService.getServicesBySalonId(salon_id);
      return services;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch services for salon');
    }
  }

  @Post('edit')
  async editService(
    @Body() updateServiceDto: UpdateServiceDto, 
  ): Promise<Service> {
    try {
      const updatedService = await this.serviceManagerService.editService(updateServiceDto);
      this.logger.log(`Service with ID ${updateServiceDto.serviceId} updated successfully.`);
      return updatedService;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; 
      }
      this.logger.error(`Failed to update service with ID ${updateServiceDto.serviceId}`, error.stack);
      throw new InternalServerErrorException('Failed to update service');
    }
  }

}
