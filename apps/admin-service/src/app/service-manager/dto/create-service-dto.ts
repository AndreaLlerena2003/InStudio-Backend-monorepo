import { IsNotEmpty, IsNumber } from 'class-validator';


export class CreateServiceDto {

  @IsNumber()
  @IsNotEmpty()
  price: number; 

  @IsNumber()
  @IsNotEmpty()
  subcategoryId: number; 

  @IsNumber()
  @IsNotEmpty()
  salon_id: number; 

}
