import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@backend-in-studio/mongoose-manager';
<<<<<<< HEAD
<<<<<<< HEAD
=======
import { Optional } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; 
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
=======
import { Optional } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; 
>>>>>>> origin/develop

@Schema({ versionKey: false })
export class Booking extends AbstractDocument {
  @Prop()
<<<<<<< HEAD
<<<<<<< HEAD
  booking_date: Date;
=======
=======
>>>>>>> origin/develop
  booking_date: string;

  @Prop()
  time_slot: string;
<<<<<<< HEAD
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
=======
>>>>>>> origin/develop

  @Prop()
  status: string;

  @Prop()
<<<<<<< HEAD
<<<<<<< HEAD
  user_id: number;
=======
  user_id: string;
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
=======
  user_id: string;
>>>>>>> origin/develop

  @Prop()
  salon_id: number;

  @Prop()
  service_id: number;

  @Prop()
<<<<<<< HEAD
<<<<<<< HEAD
  payment_id: number;
=======
=======
>>>>>>> origin/develop
  @Optional()
  payment_id?: string;

  @Prop({ default: uuidv4 })  
  bookingUUID?: string;  
<<<<<<< HEAD
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
=======

  @Prop()
  @Optional()
  totalPrice?: number;
>>>>>>> origin/develop
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
