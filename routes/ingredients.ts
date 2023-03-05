import express, { Request, Response } from "express";
import { AppDataSource } from "../src/data-source";
import { Ingredient } from "../src/entity/ingredient";

export default () => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    res.json(
      await AppDataSource.getRepository(Ingredient).find({
        relations: ["recipeItems", "recipeItems.meal"],
      })
    );
  });

  router.post("/", async (req: Request, res: Response) => {
    const input = JSON.parse(req.body);
    const ingredient = new Ingredient();
    ingredient.name = input.name;
    ingredient.storage_life = input.storageLife;
    const savedIngredient = await AppDataSource.manager.save(ingredient);
    res.json(savedIngredient);
  });

  return router;
};
