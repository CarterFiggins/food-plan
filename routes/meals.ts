import express, { Request, Response } from "express";
import _ from "lodash";
import { AppDataSource } from "../src/data-source";
import { Meal } from "../src/entity/meal";
import { Ingredient } from "../src/entity/ingredient";
import { RecipeItem } from "../src/entity/recipe_item";
import { In } from "typeorm";

export default () => {
  const router = express.Router();

  router.get("/", async (req: Request, res: Response) => {
    const meals = await AppDataSource.getRepository(Meal).find({
      relations: ["recipeItems", "recipeItems.ingredient"],
    });
    res.json(meals);
  });

  router.get("/:id", async (req: Request, res: Response) => {
    const meal = await AppDataSource.getRepository(Meal).findOne({
      where: { id: _.parseInt(req.params.id) },
      relations: ["recipeItems", "recipeItems.ingredient"],
    });
    res.json(meal);
  });

  router.delete("/:id", async (req: Request, res: Response) => {
    const recipeItemRepository = AppDataSource.getRepository(RecipeItem);
    const items = await recipeItemRepository.find({
      where: { meal: { id: _.parseInt(req.params.id) } },
      relations: ["meal"],
    });

    await recipeItemRepository.remove(items);
    await AppDataSource.getRepository(Meal).delete(req.params.id);
    res.json({ message: `Deleted ${req.params.id}` });
  });

  router.put("/:id", async (req: Request, res: Response) => {
    const recipeItemRepository = AppDataSource.getRepository(RecipeItem);
    const mealRepository = AppDataSource.getRepository(Meal);
    const ingredientRepository = AppDataSource.getRepository(Ingredient);

    await AppDataSource.getRepository(Meal).update(req.body.meal.id, {
      name: req.body.meal.name,
    });

    for (const item of req.body.meal.recipeItems) {
      let ingredient = await ingredientRepository.findOne({
        where: { name: item.ingredient.name },
      });
      if (!ingredient) {
        ingredient = new Ingredient();
        ingredient.name = item.ingredient.name;
        await ingredientRepository.save(ingredient);
      }
      if (item.id === "new") {
        const meal = await mealRepository.findOne({
          where: { id: req.body.meal.id },
        });
        const recipeItem = new RecipeItem();
        recipeItem.amount = item.amount;
        recipeItem.unit = item.unit;
        recipeItem.meal = meal as Meal;
        recipeItem.ingredient = ingredient as Ingredient;
        await recipeItemRepository.save(recipeItem);
      } else {
        await recipeItemRepository.update(item.id, {
          amount: item.amount,
          unit: item.unit,
          ingredient: ingredient,
        });
      }
    }

    recipeItemRepository.delete({ id: In(req.body.deletedIds) });
    res.json({ message: `Updated ${req.body.meal.name}` });
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

    res.json({ message: "OK" });
  });

  return router;
};
