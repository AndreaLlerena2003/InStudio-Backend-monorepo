import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UserManagerService } from './user-manager.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@backend-in-studio/db-manager-user';
import { EventPattern, Payload } from '@nestjs/microservices';
@Controller('user-manager')
export class UserManagerController {
    constructor (private readonly userManagerService: UserManagerService){
    }

    @EventPattern('user_registered')
    async create(@Payload() data: any): Promise<User>{
        try{
            return await this.userManagerService.handleUserRegistered(data);
        }catch(error){
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
