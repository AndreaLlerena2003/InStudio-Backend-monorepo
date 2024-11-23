import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { AbstractDocument } from '@backend-in-studio/mongoose-manager';

@Schema({ collection: 'availability_collection' , timestamps: true, versionKey: false })
export class Availability extends AbstractDocument{

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

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);

