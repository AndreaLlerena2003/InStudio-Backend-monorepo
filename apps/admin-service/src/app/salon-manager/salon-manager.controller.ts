import { Controller, Post, Body, Delete ,InternalServerErrorException,UploadedFile,UploadedFiles ,UseInterceptors, HttpException, HttpStatus, UseGuards, Req, Get, Logger, Patch, BadRequestException } from '@nestjs/common';
import { Admin } from '@backend-in-studio/db-manager-admin'; 
import { EventPattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { SalonManagerService } from './salon-manager.service';
import { CreateSalonDto } from '../dto/create-salon-dto';
import { Salon } from '@backend-in-studio/db-manager-admin';
import { FileInterceptor , FilesInterceptor } from '@nestjs/platform-express';
import { CreateWeeklyScheduleDto } from '../dto/add-schedule-dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { Cron } from '@nestjs/schedule'; 
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

  @Cron('0 2 * * 0')  
  async fillSchedules() {
    try {
      await this.salonManagerService.getAllSalonsIdAndSchedulesAndSendToReservation();
    } catch (error) {
      this.logger.error('Error fetching salons', error);
      throw new InternalServerErrorException('Failed to fetch salons');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-salon-photo')
  @UseInterceptors(FileInterceptor('file'))
  async updateUserProfilePhoto(@Body('salonId') salonId: string, @UploadedFile() file: Express.Multer.File) {
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

  @Post('banner-photos')
  @UseInterceptors(FilesInterceptor('files'))
  async updateBannerPhotos(
    @Body('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!id) {
      throw new BadRequestException('Salon ID is required');
    }
    return this.salonManagerService.updateSalonBannerPhotos(id, files);
  }

  @Patch('banner-photos')
  @UseInterceptors(FileInterceptor('newFile'))
  async replaceBannerPhoto(
    @Body('id') id: string,
    @Body('oldPhotoUrl') oldPhotoUrl: string,
    @UploadedFile() newFile: Express.Multer.File,
  ) {
    if (!id) {
      throw new BadRequestException('Salon ID is required');
    }
    if (!oldPhotoUrl) {
      throw new BadRequestException('Old photo URL is required');
    }
    return this.salonManagerService.replaceSalonBannerPhoto(id, oldPhotoUrl, newFile);
  }

  @Delete('banner-photos')
  async deleteBannerPhoto(
    @Body('id') id: string,
    @Body('photoUrl') photoUrl: string,
  ) {
    if (!id) {
      throw new BadRequestException('Salon ID is required');
    }
    if (!photoUrl) {
      throw new BadRequestException('Photo URL is required');
    }
    return this.salonManagerService.deleteSalonBannerPhoto(id, photoUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-weekly-schedule')
  async addWeeklySchedule(
    @Body() weeklyScheduleDto: CreateWeeklyScheduleDto,
  ): Promise<void> {
    await this.salonManagerService.addWeeklySchedule(weeklyScheduleDto);
  }

  async cronAddingWeeklySchedulesForAllSalons(){

  }

  


  @UseGuards(JwtAuthGuard)
  @Patch('edit')
  async editSalon(
    @Body() updateSalonDto: UpdateSalonDto
  ): Promise<Salon> {
    return await this.salonManagerService.editSalon(updateSalonDto);
  }


 
}
