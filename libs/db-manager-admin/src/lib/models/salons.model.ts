import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement} from 'sequelize-typescript';
<<<<<<< HEAD

=======
import { HasMany } from 'sequelize-typescript';
import { Service } from './service.model';
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
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
<<<<<<< HEAD
    allowNull: false,
=======
    allowNull: true,
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
  })
  declare profile_photo_url: string;

  @Column({
<<<<<<< HEAD
    type: DataType.STRING,
    allowNull: false,
  })
  declare banner_photos_url: string;
=======
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  declare banner_photos_url: string[];
  
  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {
      "Monday": [],
      "Tuesday": [],
      "Wednesday": [],
      "Thursday": [],
      "Friday": [],
      "Saturday": []
    },
  })
  declare schedule: {
    [day: string]: string[];
  };

  @HasMany(() => Service)
  declare services: Service[]; 
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
}
