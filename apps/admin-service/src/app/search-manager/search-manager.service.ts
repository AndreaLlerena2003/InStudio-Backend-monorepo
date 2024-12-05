import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Salon, Category, Subcategory, Service } from '@backend-in-studio/db-manager-admin';
import { Op } from 'sequelize';

@Injectable()
export class SearchManagerService {

  private readonly logger = new Logger(SearchManagerService.name);

  constructor(
    @InjectModel(Salon)
    private readonly salonService: typeof Salon,
    @InjectModel(Category)
    private readonly categoryService: typeof Category,
    @InjectModel(Subcategory)
    private readonly subcategoryService: typeof Subcategory,
  ) {}

  async searchSalons(
    name?: string,       
    categoryIds?: number[], 
    subcategoryIds?: number[], 
    minPrice?: number,   
    maxPrice?: number  
  ) {
    const salonsQuery: any = {
      where: {},
      include: [
        {
          model: Service,
          as: 'services',
          include: [
            {
              model: Subcategory,
              as: 'subcategory',
              include: [
                {
                  model: Category,
                  as: 'category',
                },
              ],
            },
          ],
        },
      ],
    };
  
    if (name) {
      salonsQuery.where.name = {
        [Op.like]: `%${name}%`,  
      };
    }
    if (categoryIds && categoryIds.length > 0) {
      salonsQuery.include[0].include[0].include[0].where = {
        id: {
          [Op.in]: categoryIds,  
        },
      };
    }
    if (subcategoryIds && subcategoryIds.length > 0) {
      salonsQuery.include[0].include[0].where = {
        id: {
          [Op.in]: subcategoryIds, 
        },
      };
    }
  
    const salons = await this.salonService.findAll(salonsQuery);
    this.logger.log('Salons found', salons.length);
    const filteredSalons = salons.map((salon) => {
      const services = Array.isArray(salon.services) ? salon.services : [];
  
      if (services.length === 0) {
        return null;
      }
  
      const totalPrice = services.reduce((sum, service) => sum + service.price, 0);
      const averagePrice = services.length > 0 ? totalPrice / services.length : 0;
  
      if (
        (minPrice && averagePrice < minPrice) ||
        (maxPrice && averagePrice > maxPrice)
      ) {
        return null; 
      }
      return {
        id: salon.id,
        name: salon.name,
        location: salon.location,
        phone: salon.phone,
        description: salon.description,
        profile_photo_url: salon.profile_photo_url,
      };
    });
    return filteredSalons.filter((salon) => salon !== null);
  }

  async getSubcategoriesByCategory(categoryId: number) {
    try {
      const subcategories = await this.subcategoryService.findAll({
        where: {
          categoryId: categoryId,
        },
      });

      return subcategories.map(subcategory => ({
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description,
      }));
    } catch (error) {
      this.logger.error('Error fetching subcategories for category', error);
      throw new Error('Error fetching subcategories');
    }
  }
}
