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
      const shoppingLists = await db("shopping_list").select('*');
      res.json(shoppingLists)
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  // Gets all info about shopping list and all shopping items
  router.get("/:id", async (req, res) => {
    try {
      const shoppingListId = req.params.id;
      const shoppingList = await db("shopping_list")
        .select([
          "shopping_list.id",
          "shopping_list.name",
          "shopping_list.is_favorite",
          db.raw(`
            COALESCE(jsonb_agg(
              DISTINCT jsonb_build_object(
                'id', shopping_item.id,
                'is_checked', shopping_item.is_checked,
                'ingredient', jsonb_build_object(
                  'id', ingredient.id,
                  'name', ingredient.name
                )
              )
            ) FILTER (WHERE shopping_item.id IS NOT NULL), '[]') AS "shoppingItems"
          `)
        ])
        .where("shopping_list.id", shoppingListId)
        .leftJoin("shopping_item", "shopping_list.id", "shopping_item.shopping_list_id")
        .leftJoin("ingredient", "ingredient.id", "shopping_item.ingredient_id")
        .groupBy("shopping_list.id")
        .first();

      res.json(shoppingList)
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.put("/:id", async (req, res) => {
  });

  router.post("/", async (req, res) => {
  });

  router.delete("/:id", async (req, res) => {
  });

  return router;
};