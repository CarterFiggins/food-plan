import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from "typeorm";
import { RecipeItem } from "./recipe_item";

@Entity()
export class Ingredient extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  storage_life: number;

  @Column({ nullable: true })
  storage_count: number;

  @OneToMany(() => RecipeItem, (recipeItem) => recipeItem.ingredient)
  recipeItems: RecipeItem[];
}
