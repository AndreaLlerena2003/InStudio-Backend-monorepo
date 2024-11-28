import { IsEnum, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { OfferType } from '../schemas/offer.schema';

export class CreateOfferDto {

  @IsOptional()
  offersUUID: string;

  @IsString()
  name: string;

  @IsString()
  dscription: string;

  @IsEnum(OfferType)
  type: OfferType;

  @IsString()
  start_date: Date;

  @IsString()
  final_date: Date;

  @IsNumber({}, { each: true })
  service_id: number[];

  @IsNumber()
  salon_id: number;

  @ValidateIf((o) => o.type === OfferType.DISCOUNT)
  @IsNumber()
  percentageDiscount?: number;

  @ValidateIf((o) => o.type === OfferType.COMBO)
  @IsString()
  comboDetails?: string;

  @ValidateIf((o) => o.type === OfferType.BONO)
  @IsNumber()
  bonoAmount?: number;
}
