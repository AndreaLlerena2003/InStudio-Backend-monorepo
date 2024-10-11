import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ServiceManagerService } from './service-manager.service';
import { CreateServiceDto } from './dto/create-service-dto'; 
import { Service } from '@backend-in-studio/sequelize-manager'; 

@Controller('service-manager')
export class ServiceManagerController {
  constructor(private readonly serviceManagerService: ServiceManagerService) {}

  @Post('create-service')
  async create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      return await this.serviceManagerService.createService(createServiceDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
