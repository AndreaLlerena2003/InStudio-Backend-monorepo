import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Req, Get, Logger, Patch, BadRequestException } from '@nestjs/common';
import { AdminManagerService } from './admin-manager.service';
import { Admin } from '@backend-in-studio/db-manager-admin'; 
import { EventPattern, Payload } from '@nestjs/microservices';
import {JwtAuthGuard} from '@backend-in-studio/auth-lib';

@Controller('admin-manager')
export class AdminManagerController {
  private readonly logger = new Logger();
  constructor(private readonly serviceManagerService: AdminManagerService) {}

  @EventPattern('adminRegistered')
    async create(@Payload() data: any): Promise<Admin>{
        try{
            return await this.serviceManagerService.handleAdminRegistered(data);
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
      return await this.serviceManagerService.getAdminData(externalId);
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
        await this.serviceManagerService.updateAdminName(userId,name);
      } catch (error) {
      if (error instanceof HttpException) {
          throw error;
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


}
