import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Salon, Admin } from '@backend-in-studio/db-manager-admin';
import { CreateSalonDto } from '../dto/create-salon-dto';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { S3Service } from 'libs/s3-manager/src/lib/s3-manager.service';
import { CreateWeeklyScheduleDto } from '../dto/add-schedule-dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
@Injectable()
export class SalonManagerService {
  private readonly logger = new Logger();
  constructor(
    @InjectModel(Salon)
    private readonly salonService: typeof Salon,
    private readonly kafkaService: KafkaService,
    private readonly s3Service: S3Service,
    @InjectModel(Admin)
    private readonly adminService: typeof Admin,
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

  
  async getSalonsByAdminId(adminId: string): Promise<Salon[]> {
    try {
      const salons = await this.salonService.findAll({
        include: [
          {
            model: Admin,
            attributes: [],
            as: 'admin',
            where: { id: adminId },
            required: true,
          },
        ],
      });
  
      this.logger.log(`Found ${salons.length} salons for admin ID: ${adminId}`);
      return salons;
    } catch (error) {
      this.logger.error(`Error fetching salons for admin ID: ${adminId}`, error);
      throw new InternalServerErrorException('Failed to fetch salons');
    }
  }


  async getSalonBySalonId(salon_id:number): Promise<Salon>{
    try{
      const salon = await this.salonService.findByPk(salon_id);
      this.logger.log(`Found ${salon} salons for salon ID: ${salon_id}`);
      return salon;
    }catch(error){
      this.logger.error(`Error fetching salons for salon ID: ${salon_id}`, error);
      throw new InternalServerErrorException('Failed to fetch salon');
    }
  }
  

  async updateSalonProfilePhoto(id: string, file: Express.Multer.File) {
    try {
        const salon = await this.salonService.findByPk(id);
        if (!salon) {
            throw new NotFoundException(`Salon with ID ${id} not found`);
        }
        const actualPhoto = salon.profile_photo_url;
        if (actualPhoto && actualPhoto.trim() !== '') {
            await this.s3Service.deleteFile(actualPhoto);
        }
        const filePath = `admin/profile_photo_url_salons/${id}`;
        const finalPath = await this.s3Service.uploadFile(file, filePath);
        salon.profile_photo_url = finalPath;
        await salon.save();
        this.logger.log(`Salon with ID ${id} successfully updated profile photo`);
        return { profilePhotoUrl: finalPath };
    } catch (error) {
        this.logger.error(`Error updating profile photo for salon with ID ${id}`, error);
        throw new InternalServerErrorException('Error updating profile photo');
    }
  }


  async addSchedule(salon_id: number, day: string, hours: string[]): Promise<void> {
    try {
      this.logger.log(`Starting to update schedule for salon ID: ${salon_id}, day: ${day}, hours: ${hours}`);
      
      const salon = await this.getSalonBySalonId(salon_id);
      if (!salon) {
        throw new NotFoundException(`Salon with ID ${salon_id} not found`);
      }
      
      const schedule = salon.schedule || {};
      schedule[day] = hours;
  
      salon.schedule = schedule;
      this.logger.log(`Updated schedule for ${day}: ${hours}`);
      
      try {
        salon.changed('schedule', true);
        await salon.save();
        this.logger.log(`Salon updated successfully for ${day}: ${JSON.stringify(hours)}`);
      } catch (saveError) {
        this.logger.error(`Failed to save salon schedule: ${saveError.message}`);
        throw new InternalServerErrorException('Error saving salon schedule');
      }
    } catch (error) {
      this.logger.error(`Error updating the schedule for salon ID: ${salon_id}`, error);
      throw new InternalServerErrorException('Error updating schedule');
    }
  }
  
  
  async addWeeklySchedule(weeklyScheduleDto: CreateWeeklyScheduleDto): Promise<{ [day: string]: string[]; }> { 
    try {
      const { salon_id, schedule } = weeklyScheduleDto;
      this.logger.log(`Starting to update weekly schedule for salon ID: ${salon_id}`);
      
      for (const { day, hours } of schedule) {
        this.logger.log(`Updating schedule for salon ID ${salon_id}, day: ${day}, hours: ${hours}`);
        await this.addSchedule(salon_id, day, hours);
      }
  
      this.logger.log(`Weekly schedule updated successfully for salon ID: ${salon_id}`);
      const finalSchedule = (await this.getSalonBySalonId(salon_id)).schedule;
      this.kafkaService.sendEvent(finalSchedule,'create-slots');
      return finalSchedule;
    } catch (error) {
      this.logger.error(`Error updating the weekly schedule for salon ID: ${weeklyScheduleDto.salon_id} - ${error.message}`);
      throw new InternalServerErrorException('Error updating weekly schedule');
    }
  }


  async editSalon(updateSalonDto: UpdateSalonDto): Promise<Salon> {
    try {
      const salon = await this.salonService.findByPk(updateSalonDto.salonId);
      if (!salon) {
        throw new NotFoundException(`Salon with ID ${updateSalonDto.salonId} not found`);
      }
  
      if (updateSalonDto.name) {
        salon.name = updateSalonDto.name;
      }
      if (updateSalonDto.location) {
        salon.location = updateSalonDto.location;
      }
      if (updateSalonDto.phone) {
        salon.phone = updateSalonDto.phone;
      }
      if (updateSalonDto.description) {
        salon.description = updateSalonDto.description;
      }
  
      if (updateSalonDto.schedule) {
        for (const { day, hours } of updateSalonDto.schedule) {
          await this.addSchedule(updateSalonDto.salonId, day, hours);
        }
      }
      await salon.save();
      const updatedSalon = await this.salonService.findByPk(updateSalonDto.salonId);
      this.logger.log(`Salon with ID ${updateSalonDto.salonId} updated successfully`);
      return updatedSalon;
    } catch (error) {
      this.logger.error(`Error updating salon with ID ${updateSalonDto.salonId}`, error);
      throw new InternalServerErrorException('Failed to update salon');
    }
  }
  
  
}
