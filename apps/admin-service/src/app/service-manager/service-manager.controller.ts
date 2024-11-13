import { Controller, Post, Body } from '@nestjs/common';
import { CreateServiceDto } from '../dto/create-service-dto';
import { Service } from '@backend-in-studio/db-manager-admin';
import { ServiceManagerService } from './service-manager.service';


@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceManagerService) {}

  @Post()
  async create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    return await this.serviceService.createService(createServiceDto);
  }

}
