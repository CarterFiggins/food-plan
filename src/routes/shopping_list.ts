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
      const shoppingList = await db("shopping_list").select('*');
      res.json(shoppingList)
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.get("/:id", async (req, res) => {
  });

  router.put("/:id", async (req, res) => {
  });

  router.post("/", async (req, res) => {
  });

  router.delete("/:id", async (req, res) => {
  });

  return router;
};