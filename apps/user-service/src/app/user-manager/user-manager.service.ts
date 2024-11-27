<<<<<<< HEAD
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
=======
import { Injectable, Inject, NotFoundException, BadRequestException, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@backend-in-studio/db-manager-user';
import { CreateUserDto } from './dto/create-user.dto';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { S3Service } from 'libs/s3-manager/src/lib/s3-manager.service';
<<<<<<< HEAD
@Injectable()
export class UserManagerService {
=======
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs'; 
@Injectable()
export class UserManagerService implements OnModuleInit {
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
    private readonly logger = new Logger();
    constructor(
        @InjectModel(User)
        private readonly userService: typeof User,
        private readonly kafkaService: KafkaService,
        private readonly s3Service: S3Service,
<<<<<<< HEAD
=======
        @Inject('auth-client') private readonly kafkaClient: ClientKafka
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
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
<<<<<<< HEAD
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
=======
                throw new Error('User not found');
            }
            let email: string;
            try {
                email = await firstValueFrom(
                    this.kafkaClient.send('get_email', authentication),
                );
                this.logger.log(`Email retrieved successfully: ${email}`);
            } catch (kafkaError) {
                this.logger.debug('Raw Error Object:', kafkaError);
                this.logger.error('Error during Kafka call for email', {
                    message: kafkaError.message || kafkaError.toString(),
                    stack: kafkaError.stack || null,
                    details: JSON.stringify(kafkaError, null, 2),
                });
                throw new Error('Error fetching email from Kafka');
            }
            const {id ,name, profile_photo_url} = user.dataValues;
            const userWithEmail = {
                id,
                name,
                profile_photo_url,
                email,
            };
            return userWithEmail;
        } catch (error) {
            this.logger.error('Error fetching user data', {
                message: error.message || error.toString(),
                stack: error.stack || null,
                details: error,
            });
            throw new Error(
                `Error processing user data for authentication: ${authentication}. Details: ${error.message || error}`,
            );
        }
    }
    
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e

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
<<<<<<< HEAD
=======

    async updatePassword(newPassword: string, authentication: string) {
        try {
            await this.kafkaService.sendEvent(
                { newPassword, authentication },
                'update-password'
            );
            return { message: 'Password update event sent successfully' };
        } catch (error) {
            this.logger.error('Error sending password update event:', error);
            throw new Error('Failed to send password update event');
        }
    }

    async onModuleInit() {
        this.logger.log('Connecting to Kafka...');
        try {
            await this.kafkaClient.subscribeToResponseOf('get_email');
            this.logger.log('Connected to Kafka');
        } catch (error) {
            this.logger.error('Failed to connect to Kafka', error);
        }
      }
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
    

}
