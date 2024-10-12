import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({
  tableName: 'analytics',
  timestamps: true,
})

export class Analytics extends Model<Analytics> {

  @PrimaryKey
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
  declare id: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare salon_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare district_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare amount: number;
 
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare count: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare service_subcategory_id: number;

}
