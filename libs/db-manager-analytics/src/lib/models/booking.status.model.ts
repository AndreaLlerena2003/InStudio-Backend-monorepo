import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({
  tableName: 'booking_status',
  timestamps: true,
})

export class Booking_Status extends Model<Booking_Status> {

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
  declare booking_status_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare name: string;


}
