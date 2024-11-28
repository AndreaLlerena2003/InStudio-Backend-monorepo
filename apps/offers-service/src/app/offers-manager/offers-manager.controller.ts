import { Controller, Post, Body, Get, Param, NotFoundException, Query } from '@nestjs/common';
import { OffersService } from './offers-manager.service';
import { CreateOfferDto } from '../dto/offers.dto';
import { Offers } from '../schemas/offer.schema';

@Controller('offers')
export class OffersController {

    constructor(private readonly offersService: OffersService) {}

    @Post()
    async createOffer(@Body() createOfferDto: CreateOfferDto): Promise<Offers> {
        return this.offersService.createOffer(createOfferDto);
    }

    @Get('service/:serviceId')
    async getOffersByServiceId(@Param('serviceId') serviceId: number): Promise<Offers[]> {
        try {
            return await this.offersService.getOffersByServiceId(serviceId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error('An unexpected error occurred while fetching offers');
        }
    }

    @Post('get-offers-by-salon')
    async getOffersBySalonId(@Body('salonId') salonId: number): Promise<any[]> {
        try {
            return await this.offersService.offersData(salonId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error('An unexpected error occurred while fetching offers');
        }
    }
}
