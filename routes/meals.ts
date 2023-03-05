import express, { Request, Response } from "express";
import _ from "lodash";
import { AppDataSource } from "../src/data-source";
import { Meal } from "../src/entity/meal";
import { Ingredient } from "../src/entity/ingredient";
import { RecipeItem } from "../src/entity/recipe_item";

export default () => {
  const router = express.Router();

  router.get("/", async (req: Request, res: Response) => {
    const meals = await AppDataSource.getRepository(Meal).find({
      relations: ["recipeItems", "recipeItems.ingredient"],
    });
    res.json(meals);
  });

  router.post("/", async (req: Request, res: Response) => {
    const ingredientRepository = AppDataSource.getRepository(Ingredient);
    const mealRepository = AppDataSource.getRepository(Meal);
    const recipeItemRepository = AppDataSource.getRepository(RecipeItem);

    const meal = new Meal();
    meal.name = req.body.mealName;
    mealRepository.save(meal);

    for (const input of req.body.ingredients) {
      if (!input.name) {
        continue;
      }
      let ingredient: null | Ingredient = null;
      if (input.id) {
        ingredient = await ingredientRepository.findOne({
          where: { id: input.id },
        });
      } else {
        ingredient = new Ingredient();
        ingredient.name = input.name;
        await ingredientRepository.save(ingredient);
      }
      const recipeItem = new RecipeItem();
      recipeItem.amount = input.amount;
      recipeItem.unit = input.unit;
      recipeItem.meal = meal;
      recipeItem.ingredient = ingredient as Ingredient;
      await recipeItemRepository.save(recipeItem);
    }

    res.status(200);
  });

  return router;
};
