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

  @Column()
  amount: number;

  @Column()
  unit: string;

  @Column({ nullable: true })
  container: string;

  @ManyToOne(() => Meal, (meal) => meal.recipeItems)
  meal: Meal;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeItems)
  ingredient: Ingredient;
}
