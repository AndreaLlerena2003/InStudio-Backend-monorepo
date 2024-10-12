import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
  tableName: 'payments',
  timestamps: true,
})
export class Payment extends Model<Payment> {

  @PrimaryKey
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
  declare id: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare payment_date: Date;

  
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare status: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare stripe_payment_id: number;

}
