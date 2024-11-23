import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AvailabilityRepository } from './availability.repository';
import { Availability } from '../schemas/availability.schema';
import { addDays, startOfWeek, format, addMinutes } from 'date-fns';


type Schedule = Record<string, string[]>;
export interface WeeklyAvailabilityInput {
  salon_id: number;
  schedules: Schedule;
}


@Injectable()
export class AvailabilityService {
    private readonly logger = new Logger(AvailabilityService.name);
    constructor(private readonly availabilityRepository: AvailabilityRepository) {}
    
    async generateWeeklySlots(input: WeeklyAvailabilityInput) {
        const { salon_id, schedules } = input;
        this.logger.log('Generating weekly slots...');
        const today = new Date();
        let nextMonday = startOfWeek(today, { weekStartsOn: 1 });
        if (today.getTime() > nextMonday.getTime()) {
            nextMonday = addDays(nextMonday, 7);
        }
        const days = Object.keys(schedules); 
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            this.logger.log(day);
            const daySchedules = schedules[day];
            if (!daySchedules || daySchedules.length < 2) {
                this.logger.warn(`Invalid schedule for day: ${day}`);
                continue; 
            }
            const [startTime, endTime] = daySchedules;
            const currentDayDate = addDays(nextMonday, i);
            const startDateTime = new Date(`${format(currentDayDate, 'yyyy-MM-dd')}T${startTime}`);
            const endDateTime = new Date(`${format(currentDayDate, 'yyyy-MM-dd')}T${endTime}`);
            let currentSlot = startDateTime;
            while (currentSlot < endDateTime) {
                this.logger.log(currentSlot);
                const nextSlot = addMinutes(currentSlot, 60);
                if (nextSlot <= endDateTime) {
                    const availability: Availability = {
                        salonId: salon_id, 
                        date: format(currentSlot, 'yyyy-MM-dd'),
                        timeSlot: `${format(currentSlot, 'HH:mm')}`,
                        timeSlotEnd: `${format(nextSlot, 'HH:mm')}`,
                        isAvailable: true,
                    };    
                    try {
                        await this.availabilityRepository.create(availability); 
                    } catch (error) {
                        this.logger.error(`Failed to save slot: ${JSON.stringify(availability)} - ${error.message}`);
                    }
                }
    
                currentSlot = nextSlot; 
            }
        }
    
    }

    async checkAvailability(date: string, timeSlot: string, salonId: number): Promise<boolean> {
        this.logger.log(`Checking availability for date: ${date} at ${timeSlot}`);
        const availability = await this.availabilityRepository.findOne({date: date, timeSlot: timeSlot, salonId: salonId});
        return availability ? availability.isAvailable : false;
    }

    async getAllAvailabilityDatesForSalonIdAndDate(salonId: number, date: string) {
        this.logger.log(`Checking availability for salon: ${salonId}, date: ${date}`);
        const [availableSlots, unavailableSlots] = await Promise.all([
            this.availabilityRepository.find({
                salonId: salonId,
                isAvailable: true,
                date: date
            }),
            this.availabilityRepository.find({
                salonId: salonId,
                isAvailable: false,
                date: date
            })
        ]);
        
        const availableResponse = availableSlots.map(availability => ({
            timeSlot: availability.timeSlot,
            timeSlotEnd: availability.timeSlotEnd
        }));
    
        const unavailableResponse = unavailableSlots.map(availability => ({
            timeSlot: availability.timeSlot,
            timeSlotEnd: availability.timeSlotEnd
        }));
        return {
            isAvailable: availableResponse,
            notAvailable: unavailableResponse
        };
    }

    async reserveSlot(date: string, timeSlot: string, salonId: number, serviceId: number): Promise<Availability> {
        this.logger.log(`Reserving slot for date: ${date} at ${timeSlot} with serviceId: ${serviceId} and salon: ${salonId}`);
        const availability = await this.availabilityRepository.findOne({ date, timeSlot, salonId });
        if (!availability || !availability.isAvailable) {
          throw new NotFoundException('Slot not available');
        }
        const updatedAvailability = await this.availabilityRepository.findOneAndUpdate(
          { date, timeSlot, salonId },
          { isAvailable: false, serviceId }
        );
        if (!updatedAvailability) {
          throw new NotFoundException('Failed to reserve slot');
        }
        this.logger.log('Slot reserved successfully');
        return updatedAvailability;
    }

    async releaseSlot(date: string, timeSlot: string, salonId: number): Promise<Availability> {
        this.logger.log(`Realseasing slot for date: ${date} at ${timeSlot}`);
        const availability = await this.availabilityRepository.findOne({ date, timeSlot, salonId });
        if (!availability) {
          throw new NotFoundException('Availability not found');
        }
        const updatedAvailability = await this.availabilityRepository.findOneAndUpdate(
            { date, timeSlot, salonId },
            { isAvailable: true, serviceId: null }
        );
        if (!updatedAvailability) {
            throw new NotFoundException('Failed to release slot');
        }
        this.logger.log('Slot release successfully');
        return updatedAvailability;
    }
    
}
