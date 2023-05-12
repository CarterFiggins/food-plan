import express, { Request, Response } from "express";
import _ from "lodash";
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

  router.get("/:id", async (req, res) => {
    const ingredient = await AppDataSource.getRepository(Ingredient).findOne({
      where: { id: _.parseInt(req.params.id) },
      relations: ["recipeItems", "recipeItems.meal"],
    });
    res.json(ingredient);
  });

  router.put("/:id", async (req: Request, res: Response) => {
    const ingredient = req.body.ingredient
    await AppDataSource.getRepository(Ingredient).update(req.params.id, {
      name: ingredient.name,
      storage_count: _.parseInt(ingredient.storageCount) || 0,
      storage_life: _.parseInt(ingredient.storageLife) || 0,
      storage_unit: ingredient.storageUnit
    })
    res.json({ message: `Updated ${req.body.ingredient.name}` });
  });

  router.post("/", async (req: Request, res: Response) => {
    const input = JSON.parse(req.body);
    const ingredient = new Ingredient();
    ingredient.name = input.name;
    ingredient.storage_life = input.storageLife;
    ingredient.storage_count = input.storageCount;
    const savedIngredient = await AppDataSource.manager.save(ingredient);
    res.json(savedIngredient);
  });

  router.delete("/:id", async (req: Request, res: Response) => { 
    let error: string|null = null
    try {
      await AppDataSource.getRepository(Ingredient).delete(req.params.id);
    } catch (err: any) {
      console.log(err)
      error = "Failed to delete"
    }
    res.json({ message: `Deleted ${req.params.id}`, error });
  })

  return router;
};
