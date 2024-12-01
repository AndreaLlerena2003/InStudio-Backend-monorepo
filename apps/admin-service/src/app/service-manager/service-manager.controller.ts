import { UseGuards ,Patch ,Controller, Post, Body, Get, HttpCode, HttpStatus, BadRequestException ,HttpException ,NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateServiceDto } from '../dto/create-service-dto';
import { Service } from '@backend-in-studio/db-manager-admin';
import { ServiceManagerService } from './service-manager.service';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { MessagePattern } from '@nestjs/microservices';
<<<<<<< HEAD
=======
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';


>>>>>>> 78369003815ae6265e7f267df3c735e1d2055cfb
class GetServicesBySalonDto {
  salon_id: number;
}

@Controller('service-manager')
export class ServiceController {
  
  private readonly logger = new Logger();
  constructor(private readonly serviceManagerService: ServiceManagerService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-service')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      return await this.serviceManagerService.createService(createServiceDto);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('get-by-id')
  async getServiceById(@Body() getServiceDto: { service_id: number }): Promise<Service> {
    const service = await this.serviceManagerService.getServiceById(getServiceDto.service_id);
    if (!service) {
      throw new NotFoundException(`Service with ID ${getServiceDto.service_id} not found`);
    }
    return service;
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-all')
  async getAllServices(): Promise<Service[]> {
    return await this.serviceManagerService.getAllServices();
  }

  @MessagePattern('get-all-services-for-analytics')
  async getAllServicesForAnalytics(@Body() body: GetServicesBySalonDto): Promise<Service[]> {
    const { salon_id } = body;

    try {
      const services = await this.serviceManagerService.getServicesBySalonIdAndCategoryId(salon_id);
      return services;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch services for salon');
    }
    // return await this.serviceManagerService.getAllServices();
  }

<<<<<<< HEAD
  @UseGuards(JwtAuthGuard)
=======
  //@UseGuards(JwtAuthGuard)
>>>>>>> 78369003815ae6265e7f267df3c735e1d2055cfb
  @Post('get-services-by-salon')
  async getServicesBySalonId(@Body() body: GetServicesBySalonDto): Promise<Service[]> {
    const { salon_id } = body;

    try {
      const services = await this.serviceManagerService.getServicesBySalonIdAndCategoryId(salon_id);
      return services;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch services for salon');
    }
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Patch('update-photo')
  @UseInterceptors(FileInterceptor('file'))
  async updateUserProfilePhoto(@Body('serviceId') serviceId , @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Profile photo file is required');
    }

    try {
      const updatedPhotoInfo = await this.serviceManagerService.updateUserProfilePhoto(serviceId, file);
      
      return {
        message: 'Profile photo updated successfully',
        photoInfo: updatedPhotoInfo, 
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @MessagePattern('get-offers-data')
  async getDataForOffers(serviceIds: number[]) {
      return await this.serviceManagerService.getServicesIdData(serviceIds);
  }


  @MessagePattern('get-booking-data')
  async getDataForBooking(data: Array<{ salon_id: number, service_id: number }>) {
      return await this.serviceManagerService.getalonAndServiceDataById(data);
  }
  
}
