import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({
  tableName: 'admins',
  timestamps: true,
})

export class Admin extends Model<Admin> {

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
