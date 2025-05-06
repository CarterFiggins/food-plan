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
      const shoppingList = await db
        .with('item_units_agg', (qb) =>
          qb
            .select('shopping_item_id')
            .from('item_unit')
            .select(
              db.raw(`jsonb_agg(jsonb_build_object(
                'id', item_unit.id,
                'amount', item_unit.amount,
                'unit', item_unit.unit
              )) as units`)
            )
            .groupBy('shopping_item_id')
        )
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
                ),
                'units', COALESCE(item_units_agg.units, '[]')
              )
            ) FILTER (WHERE shopping_item.id IS NOT NULL), '[]') AS "shoppingItems"
          `)
        ])
        .from("shopping_list")
        .leftJoin("shopping_item", "shopping_list.id", "shopping_item.shopping_list_id")
        .leftJoin("ingredient", "ingredient.id", "shopping_item.ingredient_id")
        .leftJoin("item_units_agg", "item_units_agg.shopping_item_id", "shopping_item.id")
        .where("shopping_list.id", shoppingListId)
        .groupBy("shopping_list.id")
        .limit(1)
        .first();
      
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
          .leftJoin("meal_shopping_list", "meal.id", "meal_shopping_list.meal_id")
          .leftJoin("recipe_item", "meal.id", "recipe_item.meal_id")
          .leftJoin("ingredient", "ingredient.id", "recipe_item.ingredient_id")
          .where('meal_shopping_list.shopping_list_id', shoppingListId)
          .groupBy("meal.id");

      res.json({ meals, shoppingList })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.put("/:id", async (req, res) => {
  });

  router.post("/", async (req, res) => {
    try {
      const { shoppingItems, shoppingListName, isFavorite, meals } = req.body;
      
      console.log(meals)

      await db.transaction(async (trx) => { 
        const [newShoppingList] = await trx("shopping_list").insert({ name: shoppingListName, is_favorite: isFavorite }).returning("*");
        
        for (const item of shoppingItems) {
          let ingredient = await trx("ingredient").where({ id: item.id }).first()
          const [shoppingItem] = await trx("shopping_item").insert({
            is_checked: false,
            shopping_list_id: newShoppingList.id,
            ingredient_id: ingredient.id,
          }).returning("*");
          await Promise.all(_.map(item.units, (amount, unit) => {
            return trx("item_unit").insert({
              shopping_item_id: shoppingItem.id,
              amount,
              unit,
            })
          }))
        }

        for (const meal of meals) {
          await trx("meal_shopping_list").insert({
            shopping_list_id: newShoppingList.id,
            meal_id: meal.id
          });
        }

      })
      res.json({ message: "Shopping list created successfully" });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const shoppingListId = req.params.id;
      await db("shopping_list").where({ id: shoppingListId }).del();
      res.json({ message: `Deleted shopping_list ${shoppingListId}` });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error});
    }
  });

  return router;
};