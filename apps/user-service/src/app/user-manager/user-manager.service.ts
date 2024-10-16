import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@backend-in-studio/db-manager-user';
import { CreateUserDto } from './dto/create-user.dto';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
@Injectable()
export class UserManagerService {
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
        return await this.createUser(createUserDto);
    }
}
