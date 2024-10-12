import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
  tableName: 'city',
  timestamps: true,
})
export class City extends Model<City> {

  @PrimaryKey
  @AutoIncrement
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

}
