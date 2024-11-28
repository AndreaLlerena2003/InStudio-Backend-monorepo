import {EventPattern, Payload} from '@nestjs/microservices';
import { Controller, Inject } from '@nestjs/common';
import { AvailabilityService } from '../availability.service';
import { WeeklyAvailabilityInput } from '../availability.service';


@Controller()
export class UpdateAvailabilityController {
  constructor(
    private readonly availabilityservice: AvailabilityService,
  ) {}

  @EventPattern('availability.slots.create')
  async createSlot(@Payload() message: WeeklyAvailabilityInput) {
    console.info('Availability Service: Creating slot');
    const newSlot = await this.availabilityservice.generateWeeklySlots(message);
    return {
      success: true,
      message: 'Slot created successfully',
      slot: newSlot,
    };
  }

}

