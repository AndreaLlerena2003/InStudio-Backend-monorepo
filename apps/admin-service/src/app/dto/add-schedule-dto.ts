import { IsArray, IsString, IsNotEmpty, ValidateNested, ArrayMinSize, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class ScheduleItemDto {
  @IsString()
  @IsNotEmpty()
  day: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  hours: string[];
}

export class CreateWeeklyScheduleDto {
  @IsNumber()
  @IsNotEmpty()
  salon_id: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  schedule: ScheduleItemDto[];
}
