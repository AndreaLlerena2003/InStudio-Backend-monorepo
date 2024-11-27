import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@backend-in-studio/mongoose-manager';
<<<<<<< HEAD
=======
import { Optional } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; 
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e

@Schema({ versionKey: false })
export class Booking extends AbstractDocument {
  @Prop()
<<<<<<< HEAD
  booking_date: Date;
=======
  booking_date: string;

  @Prop()
  time_slot: string;
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e

  @Prop()
  status: string;

  @Prop()
<<<<<<< HEAD
  user_id: number;
=======
  user_id: string;
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e

  @Prop()
  salon_id: number;

  @Prop()
  service_id: number;

  @Prop()
<<<<<<< HEAD
  payment_id: number;
=======
  @Optional()
  payment_id?: string;

  @Prop({ default: uuidv4 })  
  bookingUUID?: string;  
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
