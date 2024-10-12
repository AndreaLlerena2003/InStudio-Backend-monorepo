import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
  tableName: 'auth_tokens',
  timestamps: true,
})
export class AuthTokens extends Model<AuthTokens> {

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
  declare token: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare expires_at: Date;

}
