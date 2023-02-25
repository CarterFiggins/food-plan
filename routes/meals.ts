import express, { Request, Response } from "express";
import { AppDataSource } from "../src/data-source";
import { Meal } from "../src/entity/meal";

export default () => {
  const router = express.Router();

  router.get("/", async (req: Request, res: Response) => {
    console.log("HELLO THERE");
    const test = await AppDataSource.getRepository(Meal).find({
      relations: ["recipeItems", "recipeItems.ingredient"],
    });
    console.log(test);
    res.json(test);
  });

  router.post("/", async (req: Request, res: Response) => {
    console.log("req.body");
    console.log(req.body);
    const input = JSON.parse(req.body);
    console.log("input");
    console.log(input);
    const meal = new Meal();
    meal.name = input.name;
    const savedMeal = await AppDataSource.manager.save(meal);
    console.log(savedMeal);
    res.json(meal);
  });

  return router;
};
