import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo} from 'sequelize-typescript';
import { Salon } from './salons.model';
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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare subcategoryId: number; 

  @ForeignKey(() => Salon)
  @Column
  declare salon_id: number;

  @BelongsTo(() => Salon)
  declare salon: Salon;
  
}
