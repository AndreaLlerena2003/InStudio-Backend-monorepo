import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Service , Salon, Subcategory, Admin} from '@backend-in-studio/db-manager-admin';
import { CreateServiceDto } from '../dto/create-service-dto'; 
import { CreateAdminDto } from '../dto/create-admin-dto';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { S3Service } from 'libs/s3-manager/src/lib/s3-manager.service';

@Injectable()
export class AdminManagerService {
  private readonly logger = new Logger();
  constructor(
    @InjectModel(Admin)
    private readonly adminService: typeof Admin,
    private readonly kafkaService: KafkaService,
    private readonly s3Service: S3Service,
  ) {
    this.kafkaService.init();
  }

  async handleAdminRegistered(data: any) {
    const { id, name, profile_photo_url } = data;
    const createUserDto: CreateAdminDto = {
        id: id,
        name,
        profile_photo_url
    };
    try {
        const result = await this.createAdmin(createUserDto);
        this.logger.log("Admin successfully created");
        return result;
    } catch (error) {
        this.logger.error("Error creating user:", error);
        throw new InternalServerErrorException("Error creating admin");
    }
  }

  async createAdmin(createUserDto: CreateAdminDto): Promise<Admin> {
    try {
        const newUser = await this.adminService.create(createUserDto);
        return newUser;
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            throw new BadRequestException('Invalid data provided for admin creation');
        }
        throw new InternalServerErrorException('Error creating admin');
    }
  }

  async getAdminData(authentication: string) {
    try {
        const admin = await this.adminService.findByPk(authentication);
        if (admin) {
            this.logger.log(`Admin Found: ${JSON.stringify(admin, null, 2)}`);
        } else {
            this.logger.warn(`No admin found for authentication: ${authentication}`);
        }
        return admin;
    } catch (error) {
        this.logger.error('Error fetching admin data', {
            message: error.message,
            stack: error.stack,
            details: error,
        });

        throw new Error('Esto es una pruebita');
    }
  }

  async updateAdminName(authentication: string, name: string) {
    try {
        const admin = await this.adminService.findByPk(authentication);
        if (!admin) {
            throw new NotFoundException(`Admin with ID ${authentication} not found`);
        }
        admin.name = name;
        await admin.save();
        this.logger.log(`Admin with ID ${authentication} successfully updated name to ${name}`);
    } catch (error) {
        this.logger.error(`Error updating name for admin with ID ${authentication}`, error);
        if (error.name === 'SequelizeValidationError') {
            throw new BadRequestException('Invalid name provided for user update');
        }
        throw new InternalServerErrorException('Error updating user name');
    }
  }

  async updateUserProfilePhoto(id: string, file: Express.Multer.File) {
    try {
        const admin = await this.adminService.findByPk(id);
        if (!admin) {
            throw new NotFoundException(`Admin with ID ${id} not found`);
        }
        const actualPhoto = admin.profile_photo_url;
        if (actualPhoto && actualPhoto.trim() !== '') {
            await this.s3Service.deleteFile(actualPhoto);
        }
        const filePath = `admin/admin_profile_photos/${id}`;
        const finalPath = await this.s3Service.uploadFile(file, filePath);
        admin.profile_photo_url = finalPath;
        await admin.save();
        this.logger.log(`User with ID ${id} successfully updated profile photo`);
        return { profilePhotoUrl: finalPath };
    } catch (error) {
        this.logger.error(`Error updating profile photo for user with ID ${id}`, error);
        throw new InternalServerErrorException('Error updating profile photo');
    }
  }

}
