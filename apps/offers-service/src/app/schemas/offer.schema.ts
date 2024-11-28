import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@backend-in-studio/mongoose-manager';
import { Optional } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; 

export enum OfferType {
  DISCOUNT = 'DISCOUNT',
  BONO = 'BONO',
}

@Schema({ versionKey: false })
export class Offers extends AbstractDocument {
  @Prop({ default: () => uuidv4(), immutable: true })
  offersUUID: string;

  @Prop()
  name: string;

  @Prop()
  dscription: string;

  @Prop({ enum: OfferType })
  type: OfferType;

  @Prop()
  start_date: Date;

  @Prop()
  final_date: Date;

  @Prop({ type: [Number] })
  service_id: number[];

  @Prop()
  salon_id: number;

  @Prop()
  percentageDiscount?: number;

  @Prop()
  bonoAmount?: number;
}

export const OffersSchema = SchemaFactory.createForClass(Offers);


