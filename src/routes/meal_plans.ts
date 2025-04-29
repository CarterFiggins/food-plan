import express from "express";
import _ from "lodash";
import db from "../db/knex_db";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unknown error occurred";
}

export default () => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const mealPlans = await db("meal_plan")
        .select([
          "meal_plan.*",
          db.raw(`
            jsonb_build_object(
              'id', meal.id,
              'name', meal.name,
              'recipeItems', COALESCE(jsonb_agg(
                DISTINCT jsonb_build_object(
                  'id', recipe_item.id,
                  'amount', recipe_item.amount,
                  'unit', recipe_item.unit,
                  'ingredient', jsonb_build_object(
                    'id', ingredient.id,
                    'name', ingredient.name
                  )
                )
              ) FILTER (WHERE recipe_item.id IS NOT NULL), '[]')
            ) AS meal
          `)
        ])
        .orderBy("meal_plan.position", "desc")
        .leftJoin("meal", "meal_plan.meal_id", "meal.id")
        .leftJoin("recipe_item", "meal.id", "recipe_item.meal_id")
        .leftJoin("ingredient", "ingredient.id", "recipe_item.ingredient_id")
        .groupBy("meal_plan.id", "meal.id");

      res.json(mealPlans);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const { mealId, mealCreated, position, changedIngredients } = req.body;

      const meal = await db("meal").where({ id: mealId }).first();

      if (meal) {
        await db("meal_plan").where({ id: req.params.id }).update({
          meal_created: mealCreated,
          meal_id: meal.id,
          position: position,
        });

        for (const ingredient of changedIngredients as { id: number; newAmount: number }[]) {
          await db("ingredient").where({ id: ingredient.id }).update({
            storage_count: ingredient.newAmount,
          });
        }

        return res.json({ success: true });
      }

      res.json({ success: false });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: getErrorMessage(error)});
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { mealId, mealCreated, position } = req.body;

      const meal = await db("meal").where({ id: mealId }).first();

      const mealPlan = {
        meal_created: mealCreated,
        position,
        meal_id: meal ? meal.id : null,
      };

      const [id] = await db("meal_plan").insert(mealPlan).returning("id");

      res.json({ success: true, id });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await db("meal_plan").where({ id: req.params.id }).del();
      res.json({ message: `Deleted ${req.params.id}` });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  return router;
};