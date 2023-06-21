import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from "typeorm";
import { RecipeItem } from "./recipe_item";
import { MealPlan } from "./meal_plan";

@Entity()
export class Meal extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => RecipeItem, (recipeItem) => recipeItem.meal)
  recipeItems: RecipeItem[];

  @OneToMany(() => MealPlan, (mealPlan) => mealPlan.meal)
  mealPlan: MealPlan[];
}
