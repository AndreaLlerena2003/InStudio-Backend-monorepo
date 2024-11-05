import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@backend-in-studio/db-manager-user';
import { CreateUserDto } from './dto/create-user.dto';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
@Injectable()
export class UserManagerService {
    private readonly logger = new Logger();
    constructor(
        @InjectModel(User)
        private readonly userService: typeof User,
        private readonly kafkaService: KafkaService,
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
}
