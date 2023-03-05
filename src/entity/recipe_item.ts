import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { Meal } from "./meal";
import { Ingredient } from "./ingredient";

@Entity()
export class RecipeItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "decimal" })
  amount: number;

  @Column({ nullable: true })
  unit: string;

  @ManyToOne(() => Meal, (meal) => meal.recipeItems)
  meal: Meal;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeItems)
  ingredient: Ingredient;
}
