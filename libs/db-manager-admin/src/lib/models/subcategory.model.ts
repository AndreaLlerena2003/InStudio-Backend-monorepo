import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Category } from './category.model'; // Asegúrate de que el archivo category.model.ts existe

@Table({
  tableName: 'subcategories',
  timestamps: true,
})
export class Subcategory extends Model<Subcategory> {

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
    allowNull: true,
  })
  declare description: string;

  @ForeignKey(() => Category)
  @Column
  declare categoryId: number;

  @BelongsTo(() => Category)
  declare category: Category;
}
