import express from "express";
import _ from "lodash";
import db from "../db/knex_db";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unknown error occurred";
}

export default () => {
  const router = express.Router();

  router.put("/all", async (req, res) => {
    try {
      const { checked,  shoppingListId} = req.body
      await db("shopping_item").where({ shopping_list_id: shoppingListId }).update({ is_checked: checked });
      res.json({ message: "Shopping list updated successfully" });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const { id, checked } = req.body
      await db("shopping_item").where({ id }).update({ is_checked: checked });
      res.json({ message: "Shopping list updated successfully" });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  return router;
};