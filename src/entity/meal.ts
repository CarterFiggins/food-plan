import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { RecipeItem } from "./recipe_item";

@Entity()
export class Meal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => RecipeItem, (recipeItem) => recipeItem.meal)
  recipeItems: RecipeItem[];
}
