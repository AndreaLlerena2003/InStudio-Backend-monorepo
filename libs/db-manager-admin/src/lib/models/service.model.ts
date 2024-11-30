import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Salon } from './salons.model';
import { Subcategory } from './subcategory.model';  // Asegúrate de importar Subcategory

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
}
