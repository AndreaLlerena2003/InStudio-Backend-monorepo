import { Controller, Post, Body, InternalServerErrorException, UploadedFile,UseInterceptors, HttpException, HttpStatus, UseGuards, Req, Get, Logger, Patch, BadRequestException } from '@nestjs/common';
import { Admin } from '@backend-in-studio/db-manager-admin'; 
import { EventPattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { SalonManagerService } from './salon-manager.service';
import { CreateSalonDto } from '../dto/create-salon-dto';
import { Salon } from '@backend-in-studio/db-manager-admin';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('salon-manager')
export class SalonManagerController {
  private readonly logger = new Logger();
  constructor(private readonly salonManagerService: SalonManagerService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-salon')
  async createSalon(@Req() req: any, @Body() createSalonDto: CreateSalonDto): Promise<Salon> {
    try {
      const adminId = req.user?.userId;
      createSalonDto.adminId = adminId;
      const newSalon = await this.salonManagerService.createSalon(createSalonDto);
      this.logger.log(`Salon created successfully: ${newSalon.id}`);
      return newSalon;
    } catch (error) {
      this.logger.error('Error creating salon', error);
      throw new InternalServerErrorException('Failed to create salon');
    }
  }


  @UseGuards(JwtAuthGuard)
  @Get('get-salon-by-admin')
  async getSalonsByAdmin(@Req() req: any): Promise<Salon[]> {
    try {
      const adminId = req.user?.userId;
      const response = await this.salonManagerService.getSalonsByAdminId(adminId);
      
      if (!response.length) {
        this.logger.log(`No salons found for admin ID: ${adminId}`);
      }

      return response;
    } catch (error) {
      this.logger.error('Error fetching salons', error);
      throw new InternalServerErrorException('Failed to fetch salons');
    }
  }


  @UseGuards(JwtAuthGuard)
  @Patch('update-salon-photo')
  @UseInterceptors(FileInterceptor('file'))
  async updateUserProfilePhoto(@Body() salonId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Profile photo file is required');
    }
    try {
      const updatedPhotoInfo = await this.salonManagerService.updateSalonProfilePhoto(salonId,file);
      
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


 
}
