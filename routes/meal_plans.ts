import express, { Request, Response } from "express";
import _ from "lodash";
import { AppDataSource } from "../src/data-source";
import { MealPlan } from "../src/entity/meal_plan";
import { Meal } from "../src/entity/meal";
import { Ingredient } from "../src/entity/ingredient";
import internal from "stream";

export default () => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    res.json(
      await AppDataSource.getRepository(MealPlan).find({
        order: {
          position: "DESC",
        },
        relations: ["meal", "meal.recipeItems", "meal.recipeItems.ingredient"],
      })
    );
  });

  router.put("/:id", async (req, res) => {
    const { mealId, mealCreated, position, changedIngredients } = req.body;
    const meal = await AppDataSource.getRepository(Meal).findOne({
      where: { id: _.parseInt(mealId) }
    });
    if (meal) {
      await AppDataSource.getRepository(MealPlan).update(req.params.id, {
        meal_created: mealCreated,
        meal,
        position: position,
      })
      res.json({ success: true });
      for (const ingredient of changedIngredients as { id: number, newAmount: number }[]) {
        await AppDataSource.getRepository(Ingredient).update(ingredient.id, {
          storage_count: ingredient.newAmount,
        })
      }
      return;
    }
    res.json({ success: false });
  });

  router.post("/", async (req, res) => {
    const { mealId, mealCreated, position } = req.body
    const mealPlanRepository = AppDataSource.getRepository(MealPlan);
    
    const meal = await AppDataSource.getRepository(Meal).findOne({
      where: {id: _.parseInt(mealId)}
    })

    const mealPlan = new MealPlan();
    mealPlan.meal_created = mealCreated;
    mealPlan.position = position;
    if (meal) {
      mealPlan.meal = meal;
    }
    await mealPlanRepository.save(mealPlan)

    res.json({ success: true });
  })

  router.delete("/:id", async (req, res) => {
    await AppDataSource.getRepository(MealPlan).delete(req.params.id);
    res.json({ message: `Deleted ${req.params.id}` });
  })
  
  return router;
};
