import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class ResultDto {
  @IsString()
  typeBehavior: 'Reminder' | 'Offer';

  @IsString()
  @IsNotEmpty()
  salonName: string;

  @IsString()
  @IsNotEmpty()
  username: string;

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
  description?: string;
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  Email: string; // Usar solo Email

  @IsEnum(['Subscription', 'Reminder', 'Offer'])
  typeBehavior: 'Subscription' | 'Reminder' | 'Offer';

  @IsString()
  @IsNotEmpty()
  beautySalonId: string;

  @IsBoolean()
  active = true;

  @IsEnum(['Pending', 'Sent', 'Error'])
  status: 'Pending' | 'Sent' | 'Error' = 'Pending';

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

  @IsString()
  UserID_TypeBehavior_BeautySalonID: string;

  @IsString()
  Timestamp: string;

  @IsString()
  username: string; // Asegurarse de que coincida con el modelo

  @IsString()
  salonName: string; // Asegurarse de que coincida con el modelo
}