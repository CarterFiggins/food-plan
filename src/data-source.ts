import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import fs from "fs";
import { Meal } from "./entity/meal";
import { Ingredient } from "./entity/ingredient";
import { RecipeItem } from "./entity/recipe_item";
import { MealPlan } from "./entity/meal_plan";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [Meal, Ingredient, RecipeItem, MealPlan],
  migrations: [],
  subscribers: [],
});
