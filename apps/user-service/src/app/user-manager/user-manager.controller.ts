import { Controller, Post, Body, HttpException, HttpStatus, Get,Req, UseGuards, Logger } from '@nestjs/common';
import { UserManagerService } from './user-manager.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@backend-in-studio/db-manager-user';
import { EventPattern, Payload } from '@nestjs/microservices';
import {JwtAuthGuard} from '@backend-in-studio/auth-lib';
@Controller('user-manager')
export class UserManagerController {
    private readonly logger = new Logger();
    constructor (private readonly userManagerService: UserManagerService){
        
    }
    @EventPattern('userRegistered')
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

    @UseGuards(JwtAuthGuard)
    @Get('get-user-data')
    async getUserData(@Req() req: any): Promise<User> {
    const externalId = req.user?.user_id;
    this.logger.log('AuthUsers instance: ', JSON.stringify(req.user, null, 2));
    this.logger.log(externalId);
    try {
      return await this.userManagerService.getUserData(externalId);
    } catch (error) {
      this.logger.error('Error fetching user data', JSON.stringify(error, null, 2));
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Internal Server Error occurred', JSON.stringify({
        type: typeof error,
        details: error
      }, null, 2));

      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
