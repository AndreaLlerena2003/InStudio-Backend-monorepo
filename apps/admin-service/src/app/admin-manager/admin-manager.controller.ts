import { NotFoundException,Res, InternalServerErrorException,Controller, Post, Body, HttpException, HttpStatus, UseInterceptors ,UseGuards, Req, Get, Logger, Patch, BadRequestException } from '@nestjs/common';
import { AdminManagerService } from './admin-manager.service';
import { Admin } from '@backend-in-studio/db-manager-admin'; 
import { EventPattern, Payload } from '@nestjs/microservices';
import {JwtAuthGuard} from '@backend-in-studio/auth-lib';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { Response } from 'express';
@Controller('admin-manager')
export class AdminManagerController {
  private readonly logger = new Logger();
  constructor(private readonly adminManagerService: AdminManagerService) {}

  @EventPattern('adminRegistered')
    async create(@Payload() data: any): Promise<Admin>{
        try{
            return await this.adminManagerService.handleAdminRegistered(data);
        }catch(error){
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-admin-data')
    async getUserData(@Req() req: any): Promise<any> {
    const externalId = req.user?.userId;
    try {
      return await this.adminManagerService.getAdminData(externalId);
    } catch (error) {
      this.logger.error('Error fetching admin data', JSON.stringify(error, null, 2));
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
  @Patch('update-admin-name')
  async updateUserName(@Req() req: any,  @Body('name') name: string) {
    const userId = req.user?.userId;
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    try {
        await this.adminManagerService.updateAdminName(userId,name);
      } catch (error) {
      if (error instanceof HttpException) {
          throw error;
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-admin-photo')
  @UseInterceptors(FileInterceptor('file'))
  async updateUserProfilePhoto(@Req() req:any, @UploadedFile() file: Express.Multer.File) {
    console.log('File received:', file); 
    const adminId = req.user?.userId;
    if (!file) {
      throw new BadRequestException('Profile photo file is required');
    }

    try {
      const updatedPhotoInfo = await this.adminManagerService.updateUserProfilePhoto(adminId, file);
      
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

  @UseGuards(JwtAuthGuard)
  @Get('profile-photo')
  async getProfilePhoto(@Req() req:any, @Res() res: Response) {
    const adminId = req.user?.userId;
    try {
      const adminImage = await this.adminManagerService.getProfilePhoto(adminId);
      if (!adminImage) {
        throw new NotFoundException(`Profile photo not found for admin with ID ${adminId}`);
      }
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="profile_photo.png"', 
      });

      adminImage.profilePhoto.pipe(res);
    } catch (error) {
      this.logger.error(`Error retrieving profile photo for admin with ID ${adminId}`, error);
      throw new InternalServerErrorException('Error retrieving profile photo');
    }
  }


}
