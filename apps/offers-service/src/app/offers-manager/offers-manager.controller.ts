import { Controller, Post, Body, Get, Param, NotFoundException, Query } from '@nestjs/common';
import { OffersService } from './offers-manager.service';
import { CreateOfferDto } from '../dto/offers.dto';
import { Offers } from '../schemas/offer.schema';
import { OfferWithPrice } from './offers-manager.service';
import { MessagePattern } from '@nestjs/microservices';
@Controller('offers')
export class OffersController {

    constructor(private readonly offersService: OffersService) {}

    @Post()
    async createOffer(@Body() createOfferDto: CreateOfferDto): Promise<Offers> {
        return this.offersService.createOffer(createOfferDto);
    }

    @MessagePattern('get-offer-data-by-service')
    async getOffersByServiceId(service_id: number): Promise<OfferWithPrice[]> {
        try {
            return await this.offersService.getOffersByServiceId(service_id);
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
