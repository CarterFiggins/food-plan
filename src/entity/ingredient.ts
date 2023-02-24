import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { RecipeItem } from "./recipe_item";

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => RecipeItem, (recipeItem) => recipeItem.ingredient)
  recipeItems: RecipeItem[];
}
