import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
  tableName: 'district',
  timestamps: true,
})
export class District extends Model<District> {

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
