import { Controller, Post, Body, HttpCode, InternalServerErrorException, UploadedFile,UseInterceptors, HttpException, HttpStatus, UseGuards, Req, Get, Logger, Patch, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category-dto';
import { CategoryManagerService } from './category-manager.service';
import { Category } from '@backend-in-studio/db-manager-admin';

@Controller('category-manager')
export class CategoryManagerController {
  private readonly logger = new Logger();
  constructor(private readonly categoryManagerService: CategoryManagerService) {}

  @Post('create-category')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const newCategory = await this.categoryManagerService.createCategory(createCategoryDto);
      this.logger.log(`Category created successfully: ${newCategory.id}`);
      return newCategory;
    } catch (error) {
      this.logger.error('Error creating category', error);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  @Get('get-all-categories')
  @HttpCode(HttpStatus.OK)
  async getAllCategories() {
    return this.categoryManagerService.getAllCategories();
  }


  @Get('get-all-categories-with-sub')
  @HttpCode(HttpStatus.OK)
  async getAllCategoriesWithSub() {
    return this.categoryManagerService.getAllCategoriesWithSubcategories();
  }
 
}
