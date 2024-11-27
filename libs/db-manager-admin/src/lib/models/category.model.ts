<<<<<<< HEAD
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
=======
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, HasMany } from 'sequelize-typescript';
import { Subcategory } from './subcategory.model'; 
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e

@Table({
  tableName: 'categories',
  timestamps: true,
})
export class Category extends Model<Category> {
  @PrimaryKey
  @AutoIncrement
<<<<<<< HEAD
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
=======
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
    allowNull: false,
  })
  declare description: string;
<<<<<<< HEAD
=======

  @HasMany(() => Subcategory, { as: 'subcategories' })
  declare subcategories: Subcategory[];
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
}
