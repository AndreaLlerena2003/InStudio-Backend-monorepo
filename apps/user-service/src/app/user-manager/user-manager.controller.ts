import { Controller, Post, Body, UploadedFile, UseInterceptors, HttpException, BadRequestException ,HttpStatus, Get,Req, UseGuards, Logger, Patch } from '@nestjs/common';
import { UserManagerService } from './user-manager.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@backend-in-studio/db-manager-user';
import { EventPattern, Payload } from '@nestjs/microservices';
import {JwtAuthGuard} from '@backend-in-studio/auth-lib';
import { FileInterceptor } from '@nestjs/platform-express';

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
<<<<<<< HEAD
    async getUserData(@Req() req: any): Promise<User> {
=======
    async getUserData(@Req() req: any): Promise<any> {
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
    const externalId = req.user?.userId;
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

  @UseGuards(JwtAuthGuard)
  @Patch('update-user-name')
  async updateUserName(@Req() req: any,  @Body('name') name: string) {
    const userId = req.user?.userId;
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    try {
        await this.userManagerService.updateUserName(userId, name);
      } catch (error) {
      if (error instanceof HttpException) {
          throw error;
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
<<<<<<< HEAD
=======
  @Patch('update-pasword')
  async updateUserPassword(@Req() req: any,  @Body('newPassword') newPassword: string) {
    const userId = req.user?.userId;
    if (!newPassword) {
      throw new BadRequestException('NewPassword is required');
    }
    try {
        await this.userManagerService.updatePassword(newPassword,userId);
      } catch (error) {
      if (error instanceof HttpException) {
          throw error;
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
  @Patch('update-user-photo')
  @UseInterceptors(FileInterceptor('file'))
  async updateUserProfilePhoto(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    console.log('File received:', file); 
    const userId = req.user?.userId;

    if (!file) {
      throw new BadRequestException('Profile photo file is required');
    }

    try {
      const updatedPhotoInfo = await this.userManagerService.updateUserProfilePhoto(userId, file);
      
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

}
