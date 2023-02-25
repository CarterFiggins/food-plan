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
    console.log("req.body");
    console.log(req.body);
    const input = JSON.parse(req.body);
    console.log("input");
    console.log(input);
    const ingredient = new Ingredient();
    ingredient.name = input.name;
    ingredient.storage_life = input.storageLife;
    const savedIngredient = await AppDataSource.manager.save(ingredient);
    console.log(savedIngredient);
    res.json(savedIngredient);
  });

  return router;
};
