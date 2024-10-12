import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement} from 'sequelize-typescript';

@Table({
  tableName: 'salons',
  timestamps: true,
})
export class Salon extends Model<Salon> {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare location: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare profile_photo_url: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare banner_photos_url: string;
}
