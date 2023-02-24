import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Meal } from "./meal";
import { Ingredient } from "./ingredient";

@Entity()
export class RecipeItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  count: string;

  @Column()
  unit: string;

  @Column()
  container: string;

  @ManyToOne(() => Meal, (meal) => meal.recipeItems)
  meal: Meal;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeItems)
  ingredient: Ingredient;
}
