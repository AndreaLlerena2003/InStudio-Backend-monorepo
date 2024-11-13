import { IsDate, IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class MetricsDto {
  @IsNotEmpty()
  @IsDateString()
  start_date: Date;
  
  @IsNotEmpty()
  @IsDateString()
  end_date: Date;
}
