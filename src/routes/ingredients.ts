import express, { Request, Response } from "express";
import _ from "lodash";
import db from "../db/knex_db";

export default () => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const ingredients = await db("ingredient")
        .select([
          "ingredient.id",
          "ingredient.name",
          "ingredient.storage_life",
          "ingredient.storage_count",
          "ingredient.storage_unit",
          db.raw(`
            COALESCE(jsonb_agg(
              DISTINCT jsonb_build_object(
                'id', meal.id,
                'name', meal.name
              )
            ) FILTER (WHERE meal.id IS NOT NULL), '[]') AS "meals"
          `)
        ])
        .leftJoin("recipe_item", "ingredient.id", "recipe_item.ingredient_id")
        .leftJoin("meal", "recipe_item.meal_id", "meal.id")
        .groupBy("ingredient.id");
  
      res.json(ingredients);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const ingredientId = req.params.id;

      const ingredient = await db("ingredient").select("ingredient.*")
        .where( "ingredient.id", ingredientId )
        .first();

      res.json(ingredient);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch ingredient" });
    }
  });

  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const ingredientId = req.params.id;
      const { name, storageCount, storageLife, storageUnit } = req.body.ingredient;

      await db("ingredient").where({ id: ingredientId }).update({
        name,
        storage_count: _.toInteger(storageCount) || 0,
        storage_life: _.toInteger(storageLife) || 0,
        storage_unit: storageUnit,
      });

      res.json({ message: `Updated ${name}` });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to update ingredient" });
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    try {
      const { name, storageLife, storageCount, storageUnit } = req.body;

      const [newIngredient] = await db("ingredient")
        .insert({
          name,
          storage_life: storageLife,
          storage_count: storageCount,
          storage_unit: storageUnit,
        })
        .returning("*");

      res.json(newIngredient);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to create ingredient" });
    }
  });

  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const ingredientId = req.params.id;
      await db("ingredient").where({ id: ingredientId }).del();

      res.json({ message: `Deleted ${ingredientId}` });
    } catch (error) {
      console.log(error);
      res.json({ message: `Failed to delete ingredient`, error: "Failed to delete" });
    }
  });

  return router;
};