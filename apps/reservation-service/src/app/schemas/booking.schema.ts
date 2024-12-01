import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@backend-in-studio/mongoose-manager';
import { Optional } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; 

@Schema({ versionKey: false })
export class Booking extends AbstractDocument {
  @Prop()
  booking_date: string;

  @Prop()
  time_slot: string;

  @Prop()
  status: string;

  @Prop()
  user_id: string;

  @Prop()
  salon_id: number;

  @Prop()
  service_id: number;

  @Prop()
  @Optional()
  payment_id?: string;

  @Prop({ default: uuidv4 })  
  bookingUUID?: string;  
<<<<<<< HEAD
=======

  @Prop()
  @Optional()
  totalPrice?: number;
>>>>>>> 78369003815ae6265e7f267df3c735e1d2055cfb
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
