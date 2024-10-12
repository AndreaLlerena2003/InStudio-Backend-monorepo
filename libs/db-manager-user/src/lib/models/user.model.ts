import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, IsEmail, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {

  @PrimaryKey
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare profile_photo_url: string;

}
