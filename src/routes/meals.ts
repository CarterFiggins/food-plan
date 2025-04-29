import express, { Request, Response } from "express";
import _ from "lodash";
import db from "../db/knex_db";

export default () => {
  const router = express.Router();

  router.get("/", async (req: Request, res: Response) => {
    try {
      const meals = await db("meal")
      .select([
        "meal.id",
        "meal.name",
        db.raw(`
          COALESCE(jsonb_agg(
            DISTINCT jsonb_build_object(
              'id', recipe_item.id,
              'amount', recipe_item.amount,
              'unit', recipe_item.unit,
              'ingredient', jsonb_build_object(
                'id', ingredient.id,
                'name', ingredient.name
              )
            )
          ) FILTER (WHERE recipe_item.id IS NOT NULL), '[]') AS "recipeItems"
        `)
      ])
        .leftJoin("recipe_item", "meal.id", "recipe_item.meal_id")
        .leftJoin("ingredient", "ingredient.id", "recipe_item.ingredient_id")
        .groupBy("meal.id");

      res.json(meals);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error});
    }
  });

  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const mealId = req.params.id;
      const meal = await db("meal")
        .select([
          "meal.id",
          "meal.name",
          db.raw(`
            COALESCE(jsonb_agg(
              DISTINCT jsonb_build_object(
                'id', recipe_item.id,
                'amount', recipe_item.amount,
                'unit', recipe_item.unit,
                'ingredient', jsonb_build_object(
                  'id', ingredient.id,
                  'name', ingredient.name
                )
              )
            ) FILTER (WHERE recipe_item.id IS NOT NULL), '[]') AS "recipeItems"
          `)
        ])
        .where("meal.id", mealId)
        .leftJoin("recipe_item", "meal.id", "recipe_item.meal_id")
        .leftJoin("ingredient", "ingredient.id", "recipe_item.ingredient_id")
        .groupBy("meal.id")
        .first();
      
      console.log("meal")
      console.log(meal)

      res.json(meal);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error});
    }
  });

  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const mealId = req.params.id;

      await db.transaction(async (trx) => {
        await trx("recipe_item").where({ meal_id: mealId }).del();
        await trx("meal").where({ id: mealId }).del();
      });

      res.json({ message: `Deleted meal ${mealId}` });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error});
    }
  });

  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const mealId = req.params.id;
      const { meal, deletedIds } = req.body;

      await db.transaction(async (trx) => {
        await trx("meal").where({ id: mealId }).update({ name: meal.name });

        for (const item of meal.recipeItems) {
          let ingredient = await trx("ingredient")
            .where({ name: item.ingredient.name })
            .first();

          if (!ingredient) {
            const [newIngredient] = await trx("ingredient")
              .insert({ name: item.ingredient.name })
              .returning("*");
            ingredient = newIngredient;
          }

          if (item.id === "new") {
            await trx("recipe_item").insert({
              amount: item.amount,
              unit: item.unit,
              meal_id: mealId,
              ingredient_id: ingredient.id,
            });
          } else {
            await trx("recipe_item")
              .where({ id: item.id })
              .update({
                amount: item.amount,
                unit: item.unit,
                ingredient_id: ingredient.id,
              });
          }
        }

        if (deletedIds.length > 0) {
          await trx("recipe_item").whereIn("id", deletedIds).del();
        }
      });

      res.json({ message: `Updated ${meal.name}` });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error});
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    try {
      const { mealName, ingredients } = req.body;

      await db.transaction(async (trx) => {
        const [newMeal] = await trx("meal").insert({ name: mealName }).returning("*");

        for (const input of ingredients) {
          if (!input.name) continue;

          let ingredient = input.id
            ? await trx("ingredient").where({ id: input.id }).first()
            : await trx("ingredient").insert({ name: input.name }).returning("*").then((rows) => rows[0]);

          await trx("recipe_item").insert({
            amount: input.amount,
            unit: input.unit,
            meal_id: newMeal.id,
            ingredient_id: ingredient.id,
          });
        }
      });

      res.json({ message: "Meal created successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  });

  return router;
};