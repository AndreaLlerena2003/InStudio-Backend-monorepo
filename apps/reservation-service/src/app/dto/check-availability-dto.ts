import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CheckAvailabilityDto {

    @IsNotEmpty()
    @IsInt()
    salonId: number;

    @IsNotEmpty()
    @IsString()
    date: string;

}