import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { Meal } from "./meal";

@Entity()
export class MealPlan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  position: number;

  @Column({ default: false })
  meal_created: boolean;

  @ManyToOne(() => Meal, (meal) => meal.mealPlan)
  meal: Meal;
}
