import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class ResultDto {
  @IsString()
  TypeBehavior: 'Reminder' | 'Offer';

  @IsString()
  @IsNotEmpty()
  SalonName: string;

  @IsString()
  @IsNotEmpty()
  UserName: string;

  @IsString()
  @IsOptional()
  Date?: string;  // Cambiado de date a Date

  @IsString()
  @IsOptional()
  Time?: string;  // Cambiado de time a Time

  @IsString()
  @IsOptional()
  Service?: string;  // Cambiado de service a Service

  @IsString()
  @IsOptional()
  Description?: string;  // Cambiado de description a Description
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  UserId: string;

  @IsString()
  @IsNotEmpty()
  Email: string; // Usar solo Email

  @IsEnum(['Subscription', 'Reminder', 'Offer'])
  TypeBehavior: 'Subscription' | 'Reminder' | 'Offer';

  @IsString()
  @IsNotEmpty()
  BeautySalonID: string; // Usar  en lugar de BeautySalonID

  @IsBoolean()
  Active = true;  // Cambiado de 'active' a 'Active'

  @IsEnum(['Pending', 'Sent', 'Error'])
  Status: 'Pending' | 'Sent' | 'Error' = 'Pending';  // Cambiado de 'status' a 'Status'

  @IsString()
  @IsOptional()
  Date?: string;  // Cambiado de 'date' a 'Date'

  @IsString()
  @IsOptional()
  Time?: string;  // Cambiado de 'time' a 'Time'

  @IsString()
  @IsOptional()
  Service?: string;  // Cambiado de 'service' a 'Service'

  @IsString()
  @IsOptional()
  ReminderID?: string;  // Cambiado de 'reminderId' a 'ReminderID'

  @IsString()
  @IsOptional()
  OfferID?: string;  // Cambiado de 'OfferID' a 'OfferID'

  @IsString()
  @IsOptional()
  Description?: string;  // Cambiado de 'description' a 'Description'

  @IsString()
  UserID_TypeBehavior_BeautySalonID: string;

  @IsString()
  Timestamp: string;

  @IsString()
  @IsNotEmpty()
  UserName: string; // Cambiar de UserName a UserName

  @IsString()
  @IsNotEmpty()
  SalonName: string; // Cambiar de SalonName a SalonName
}