import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@backend-in-studio/mongoose-manager';

@Schema({ versionKey: false })
export class Booking extends AbstractDocument {
  @Prop()
  booking_date: Date;

  @Prop()
  status: string;

  @Prop()
  user_id: number;

  @Prop()
  salon_id: number;

  @Prop()
  service_id: number;

  @Prop()
  payment_id: number;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
