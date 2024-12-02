import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { AbstractDocument } from '@backend-in-studio/mongoose-manager';

@Schema({ collection: 'completed_availability_collection' , timestamps: true, versionKey: false })
export class AvailabilityCompleted extends AbstractDocument{

    @Prop()
    salonId?: number;

    @Prop()
    serviceId?: number;
  
    @Prop({ required: true })
    date: string; 

    @Prop({ required: true })
    timeSlot: string; 

    @Prop()
    timeSlotEnd?: string;
  
    @Prop({ required: true, default: true })
    isAvailable: boolean; 
}

export const AvailabilityCompletedSchema = SchemaFactory.createForClass(AvailabilityCompleted);

