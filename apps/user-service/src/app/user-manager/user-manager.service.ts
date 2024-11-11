import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@backend-in-studio/db-manager-user';
import { CreateUserDto } from './dto/create-user.dto';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { S3Service } from 'libs/s3-manager/src/lib/s3-manager.service';
@Injectable()
export class UserManagerService {
    private readonly logger = new Logger();
    constructor(
        @InjectModel(User)
        private readonly userService: typeof User,
        private readonly kafkaService: KafkaService,
        private readonly s3Service: S3Service,
    ) {
        this.kafkaService.init();
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        try {
            const newUser = await this.userService.create(createUserDto);
            return newUser;
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                throw new BadRequestException('Invalid data provided for user creation');
            }
            throw new InternalServerErrorException('Error creating user');
        }
    }

    async handleUserRegistered(data: any) {
        const { id, name, profile_photo_url, districtId } = data;
        const createUserDto: CreateUserDto = {
            id: id,
            name,
            profile_photo_url,
            districtId
        };
        try {
            const result = await this.createUser(createUserDto);
            this.logger.log("User successfully created");
            return result;
        } catch (error) {
            this.logger.error("Error creating user:", error);
            throw new InternalServerErrorException("Error creating user");
        }
    }
    

    async getUserData(authentication: string) {
        try {
            const user = await this.userService.findByPk(authentication);
            if (user) {
                this.logger.log(`User Found: ${JSON.stringify(user, null, 2)}`);
            } else {
                this.logger.warn(`No user found for authentication: ${authentication}`);
            }
            return user;
        } catch (error) {
            this.logger.error('Error fetching user data', {
                message: error.message,
                stack: error.stack,
                details: error,
            });
    
            throw new Error('Esto es una pruebita');
        }
    }

    async updateUserName(authentication: string, name: string) {
        try {
            const user = await this.userService.findByPk(authentication);
            if (!user) {
                throw new NotFoundException(`User with ID ${authentication} not found`);
            }

            user.name = name;
            await user.save();
            this.logger.log(`User with ID ${authentication} successfully updated name to ${name}`);
        } catch (error) {
            this.logger.error(`Error updating name for user with ID ${authentication}`, error);
            if (error.name === 'SequelizeValidationError') {
                throw new BadRequestException('Invalid name provided for user update');
            }
            throw new InternalServerErrorException('Error updating user name');
        }
    }

    async updateUserProfilePhoto(id: string, file: Express.Multer.File) {
        try {
            const user = await this.userService.findByPk(id);
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
            
            const actualPhoto = user.profile_photo_url;
            if (actualPhoto && actualPhoto.trim() !== '') {
                await this.s3Service.deleteFile(actualPhoto);
            }
            
            const filePath = `profile_photos_user/${id}`;
            const finalPath = await this.s3Service.uploadFile(file, filePath);
            user.profile_photo_url = finalPath;
            await user.save();
            this.logger.log(`User with ID ${id} successfully updated profile photo`);
            return { profilePhotoUrl: finalPath };
        } catch (error) {
            this.logger.error(`Error updating profile photo for user with ID ${id}`, error);
            throw new InternalServerErrorException('Error updating profile photo');
        }
    }
    

}
