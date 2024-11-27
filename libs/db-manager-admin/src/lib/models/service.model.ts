<<<<<<< HEAD
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement} from 'sequelize-typescript';
=======
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Salon } from './salons.model';
import { Subcategory } from './subcategory.model';  // Asegúrate de importar Subcategory
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e

@Table({
  tableName: 'services',
  timestamps: true,
})
export class Service extends Model<Service> {

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.STRING,
<<<<<<< HEAD
    allowNull: false,
  })
  declare photo: string;
  
=======
    allowNull: true,
  })
  declare photo: string;

  @ForeignKey(() => Subcategory)  
  @Column
  declare subcategoryId: number;

  @ForeignKey(() => Salon)
  @Column
  declare salon_id: number;

  @BelongsTo(() => Salon)
  declare salon: Salon;

  @BelongsTo(() => Subcategory)  
  declare subcategory: Subcategory;
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
}
