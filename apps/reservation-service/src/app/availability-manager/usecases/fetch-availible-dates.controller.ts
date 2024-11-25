import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller, Inject, Post, Body, HttpStatus, HttpException, Logger, HttpCode, UseGuards } from '@nestjs/common';
import { AvailabilityService } from '../availability.service';
import { CheckAvailabilityDto } from '../../dto/check-availability-dto';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';

@Controller('check-availability')
export class CheckAvailabilityController{

    private readonly logger = new Logger(CheckAvailabilityController.name);
    constructor(
        private readonly availabilityService: AvailabilityService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('slots-check')
    @HttpCode(HttpStatus.OK)
    async checkAvailability(@Body() data: CheckAvailabilityDto) {
        try {
            const result = await this.availabilityService.getAllAvailabilityDatesForSalonIdAndDate(data.salonId, data.date);
            return {
                statusCode: HttpStatus.OK,
                message: 'Slots retrieved successfully',
                data: result,
            };
        } catch (error) {
            this.logger.error(`Error fetching availability for salonId ${data.salonId} on date ${data.date}`, error.stack);
            throw new HttpException(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Failed to fetch availability slots',
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
