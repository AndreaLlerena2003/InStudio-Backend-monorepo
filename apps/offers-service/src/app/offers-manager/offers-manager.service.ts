import { Injectable, Logger, NotFoundException, Inject, OnModuleInit } from '@nestjs/common';
import { OffersRepository } from './offers-manager.repository';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { randomUUID } from 'crypto';
import { CreateOfferDto } from '../dto/offers.dto';
import { OfferType, Offers } from '../schemas/offer.schema';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OffersService implements OnModuleInit {

    private readonly logger = new Logger(OffersService.name);

    constructor(
        private readonly offersRepository: OffersRepository,
        private readonly kafkaService: KafkaService,
        @Inject('admin-client') private readonly kafkaClient: ClientKafka
    ) {
        this.kafkaService.init();
    }

    async onModuleInit() {
        try {
            await this.kafkaClient.subscribeToResponseOf('get-offers-data');
            await this.kafkaClient.subscribeToResponseOf('get-offers-data.reply');
        } catch (error) {
            console.error('Failed to connect to Kafka', error);
        }
    }

    async createOffer(createOfferDto: CreateOfferDto): Promise<Offers> {
        this.logger.log('Creating a new offer');
        switch (createOfferDto.type) {
            case OfferType.DISCOUNT:
                if (!createOfferDto.percentageDiscount) {
                    throw new Error('percentageDiscount is required for DISCOUNT offers');
                }
                break;
    
            case OfferType.COMBO:
                if (!createOfferDto.comboDetails) {
                    throw new Error('comboDetails is required for COMBO offers');
                }
                break;
    
            case OfferType.BONO:
                if (!createOfferDto.bonoAmount) {
                    throw new Error('bonoAmount is required for BONO offers');
                }
                break;
    
            default:
                throw new Error('Invalid offer type');
        }

        createOfferDto.offersUUID = randomUUID();
      
        const savedOffer = await this.offersRepository.create(createOfferDto);    
        this.logger.log(`Offer created successfully with UUID: ${savedOffer.offersUUID}`);
      
        return savedOffer;
    }

    
    async getOffersByServiceId(serviceId: number): Promise<Offers[]> {
        this.logger.log(`Fetching offers for service ID: ${serviceId}`);

        const offers = await this.offersRepository.find({serviceId});

        if (!offers || offers.length === 0) {
            this.logger.warn(`No offers found for service ID: ${serviceId}`);
            throw new NotFoundException(`No offers found for service ID: ${serviceId}`);
        }

        this.logger.log(`Found ${offers.length} offers for service ID: ${serviceId}`);
        return offers;
    }

    async offersData(salonId: number): Promise<any> {
        const { offers, offersData } = await this.getOffersBySalonId(salonId);
        const salonData = offersData[salonId];
        if (!salonData) {
            this.logger.error(`No service data found for salon ID ${salonId}`);
            throw new Error(`No service data found for salon ID ${salonId}`);
        }

        const offersWithData = offers.map(offer => {
          
            const offerData = offer._doc; 
            const serviceData = salonData.categories
                .flatMap(category => category.services)  
                .find(service => offerData.service_id.includes(service.serviceId));  

            return {
                ...offerData, 
                serviceData: serviceData ? serviceData : null
            };
        });
    
        return offersWithData;
    }
    

    async getOffersBySalonId(salonId: number): Promise<any> {
        this.logger.log(`Fetching offers for salon ID: ${salonId}`);
        const offers = await this.offersRepository.find({ salon_id: salonId });
    
        if (!offers || offers.length === 0) {
            this.logger.warn(`No offers found for salon ID: ${salonId}`);
            throw new NotFoundException(`No offers found for salon ID: ${salonId}`);
        }
    
        this.logger.log(`Found ${offers.length} offers for salon ID: ${salonId}`);
    
        const serviceIds: number[] = offers
            .map(offer => offer.service_id)
            .flat();
    
        this.logger.log(`Service IDs for salon ID ${salonId}: ${serviceIds.join(', ')}`);
        this.logger.log(serviceIds);
    
        let offersData: any;
        try {
            offersData = await firstValueFrom(
                this.kafkaClient.send('get-offers-data', serviceIds)
            );
        } catch (kafkaError) {
            this.logger.debug('Raw Error Object:', kafkaError);
            this.logger.error('Error during Kafka call for offers data', {
                message: kafkaError.message || kafkaError.toString(),
                stack: kafkaError.stack || null,
                details: JSON.stringify(kafkaError, null, 2),
            });
            throw new Error('Error fetching offers data from Kafka');
        }
    
        return { offers, offersData };
    }
    
}
