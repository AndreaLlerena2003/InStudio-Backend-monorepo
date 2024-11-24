import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class ResultDto {
  @IsString()
  date: string;

  @IsString()
  time: string;

  @IsString()
  service: string;

  @IsString()
  description: string;

  @IsString()
  salonId: string;
  
  // Opcional: agregar campos adicionales si es necesario
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(['Subscription', 'Reminder', 'Offer'])
  typeBehavior: 'Subscription' | 'Reminder' | 'Offer';

  @IsString()
  @IsNotEmpty()
  beautySalonId: string;

  @IsBoolean()
  active = true;

  @IsEnum(['Pendiente', 'Enviado', 'Error'])
  status: 'Pendiente' | 'Enviado' | 'Error' = 'Pendiente';

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsOptional()
  service?: string;

  @IsString()
  @IsOptional()
  reminderId?: string;

  @IsString()
  @IsOptional()
  offerId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}