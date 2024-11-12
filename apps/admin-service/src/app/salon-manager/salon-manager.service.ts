import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Salon, Admin } from '@backend-in-studio/db-manager-admin';
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
            as: 'admin',   
            where: { id: adminId },
            required: true, 
          }
        ]
      });

      if (!salons.length) {
        throw new NotFoundException('No salons found for the given admin ID');
      }

      this.logger.log(`Found ${salons.length} salons for admin ID: ${adminId}`);
      return salons;
    } catch (error) {
      this.logger.error(`Error fetching salons for admin ID: ${adminId}`, error);
      throw new InternalServerErrorException('Failed to fetch salons');
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

  async updateSalonBannerPhotos(id: string, filesAndDeletes: Record<string, Express.Multer.File>, deletedFileNames: string[] = []): Promise<{ bannerPhotoUrls: string[] }> {
    
    try {
      const totalFiles = Object.keys(filesAndDeletes).length;
      if (totalFiles > 5) {
        throw new BadRequestException('You can upload a maximum of 5 banner photos.');
      }
      const salon = await this.salonService.findByPk(id);
      if (!salon) {
        throw new NotFoundException(`Salon with ID ${id} not found`);
      }
      let updatedBannerUrls: string[] = salon.banner_photos_url ? salon.banner_photos_url.split(',') : [];

      if (updatedBannerUrls.length === 0) {
        const newFilePaths: string[] = [];
        for (const [deletedFileName, newFile] of Object.entries(filesAndDeletes)) {
          const filePath = `admin/banner_photos_salons/${id}/`;
          const finalPath = await this.s3Service.uploadFile(newFile, filePath);
          newFilePaths.push(finalPath);
        }
        updatedBannerUrls = newFilePaths;
      } else {
        if (deletedFileNames.length > 0) {
          for (const deletedFileName of deletedFileNames) {
            if (updatedBannerUrls.includes(deletedFileName)) {
              await this.s3Service.deleteFile(deletedFileName); 
              updatedBannerUrls = updatedBannerUrls
                .filter(url => !url.includes(deletedFileName)); 
            }
          }
        }

        const newFilePaths: string[] = [];
        for (const [deletedFileName, newFile] of Object.entries(filesAndDeletes)) {
          if (deletedFileName !== 'null') {
            const indexToReplace = updatedBannerUrls.findIndex(url => url.includes(deletedFileName));
            if (indexToReplace !== -1) {
              const filePath = `admin/banner_photos_salons/${id}/`;
              const finalPath = await this.s3Service.uploadFile(newFile, filePath);
              updatedBannerUrls[indexToReplace] = finalPath;
            }
          } else {
            const filePath = `admin/banner_photos_salons/${id}/`;
            const finalPath = await this.s3Service.uploadFile(newFile, filePath);
            newFilePaths.push(finalPath);
          }
        }
        updatedBannerUrls = updatedBannerUrls.concat(newFilePaths);
      }
      salon.banner_photos_url = updatedBannerUrls.join(',');
      await salon.save();
      this.logger.log(`Salon with ID ${id} successfully updated banner photos`);
      return { bannerPhotoUrls: updatedBannerUrls };
    } catch (error) {
      this.logger.error(`Error updating banner photos for salon with ID ${id}`, error);
      throw new InternalServerErrorException('Error updating banner photos');
    }
  }
}
