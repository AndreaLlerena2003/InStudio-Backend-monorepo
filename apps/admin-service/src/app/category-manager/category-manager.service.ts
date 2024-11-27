import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { S3Service } from 'libs/s3-manager/src/lib/s3-manager.service';
import { CreateCategoryDto } from '../dto/create-category-dto';
import { Category } from '@backend-in-studio/db-manager-admin';
import { Subcategory } from '@backend-in-studio/db-manager-admin';

@Injectable()
export class CategoryManagerService {
  private readonly logger = new Logger();
  constructor(
    @InjectModel(Category)
    private readonly categoryService: typeof Category,
    private readonly kafkaService: KafkaService,
    private readonly s3Service: S3Service,
  ) {
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const newCategory = await this.categoryService.create({
        ...createCategoryDto
      });

      this.logger.log(`Category created successfully: ${newCategory.id}`);
      return newCategory;
    } catch (error) {
      this.logger.error('Error creating category', error);
      throw new InternalServerErrorException('Failed to create salon');
    }
  }  


  async getAllCategories(): Promise<Category[]> {
    try {
      const categories = await this.categoryService.findAll();

      if (categories.length === 0) {
        throw new NotFoundException('No categories found');
      }

      this.logger.log(`Fetched all categories: ${categories.length} categories found`);
      return categories;
    } catch (error) {
      this.logger.error('Error fetching categories', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }


  async getAllCategoriesWithSubcategories(): Promise<Category[]> {
    try {
      const categories = await this.categoryService.findAll({
        include: [{
          model: Subcategory,
          as: 'subcategories', 
        }],
      });
  
      if (categories.length === 0) {
        throw new NotFoundException('No categories found');
      }
  
      this.logger.log(`Fetched all categories with subcategories: ${categories.length} categories found`);
      return categories;
    } catch (error) {
      this.logger.error('Error fetching categories with subcategories', error);
      throw new InternalServerErrorException('Failed to fetch categories with subcategories');
    }
  }
  


  
}
