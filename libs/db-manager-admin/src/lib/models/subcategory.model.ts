<<<<<<< HEAD
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
=======
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Category } from './category.model'; // Asegúrate de que el archivo category.model.ts existe
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e

@Table({
  tableName: 'subcategories',
  timestamps: true,
})
export class Subcategory extends Model<Subcategory> {
<<<<<<< HEAD
  @PrimaryKey
  @AutoIncrement
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
=======

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
<<<<<<< HEAD
    allowNull: false,
  })
  declare description: string;
=======
    allowNull: true,
  })
  declare description: string;

  @ForeignKey(() => Category)
  @Column
  declare categoryId: number;

  @BelongsTo(() => Category)
  declare category: Category;
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
}
