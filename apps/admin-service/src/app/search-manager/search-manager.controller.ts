import { Controller, Post, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { SearchManagerService } from './search-manager.service';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';

interface SearchSalonsDto {
  name?: string;
  categoryIds?: number[]; 
  subcategoryIds?: number[]; 
  minPrice?: number; 
  maxPrice?: number; 
}

@Controller('search-manager')
export class SearchManagerController {
  constructor(private readonly searchManagerService: SearchManagerService) {}

  //@UseGuards(JwtAuthGuard)
  @Post('search')
  async searchSalons(@Body() searchFilters: SearchSalonsDto) {
    const { name, categoryIds, subcategoryIds, minPrice, maxPrice } = searchFilters;
    if (minPrice && isNaN(minPrice)) {
      throw new BadRequestException('The value of minPrice must be a number.');
    }

    if (maxPrice && isNaN(maxPrice)) {
      throw new BadRequestException('The value of maxPrice must be a number.');
    }
    const salons = await this.searchManagerService.searchSalons(
      name,
      categoryIds,
      subcategoryIds,
      minPrice,
      maxPrice
    );

    return salons;
  }

  @UseGuards(JwtAuthGuard)
  @Post('subcategories-by-category')
  async getSubcategoriesByCategory(@Body() body: { categoryId: number }) {
    const { categoryId } = body;

    if (isNaN(categoryId)) {
      throw new Error('Invalid categoryId');
    }

    return this.searchManagerService.getSubcategoriesByCategory(categoryId);
  }
}
