import { Controller, Post, Body, InternalServerErrorException, UploadedFile,UseInterceptors, HttpException, HttpStatus, UseGuards, Req, Get, Logger, Patch, BadRequestException, HttpCode } from '@nestjs/common';
import { CreateSubcategoryDto } from '../dto/create-subcategory-dto';
import { SubcategoryManagerService } from './subcategory-manager.service';
import { Subcategory } from '@backend-in-studio/db-manager-admin';

@Controller('subcategory-manager')
export class SubcategoryManagerController {
  private readonly logger = new Logger();
  constructor(private readonly subcategoryManagerService: SubcategoryManagerService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('create-subcategory')
  async createSubcategory(@Body() createSubcategoryDto: CreateSubcategoryDto): Promise<Subcategory> {
    try {
      const newSubcategory = await this.subcategoryManagerService.createSubcategory(createSubcategoryDto);
      this.logger.log(`Subcategory created successfully: ${newSubcategory.id}`);
      return newSubcategory;
    } catch (error) {
      this.logger.error('Error creating subcategory', error);
      throw new InternalServerErrorException('Failed to create subcategory');
    }
  }

  @Get('all-subcategories')
  @HttpCode(HttpStatus.OK)
  async getAllSubcategories(): Promise<Subcategory[]> {
    try {
      return await this.subcategoryManagerService.getAllSubcategories();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch subcategories');
    }
  }
 
}
