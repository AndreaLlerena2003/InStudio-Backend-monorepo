import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
  tableName: 'regions',
  timestamps: true,
})
export class Region extends Model<Region> {

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
