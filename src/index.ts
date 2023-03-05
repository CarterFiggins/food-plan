import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mealRoutes from "../routes/meals";
import ingredientRoutes from "../routes/ingredients";
import "reflect-metadata";
import { AppDataSource } from "./data-source";

dotenv.config();

async function main() {
  await AppDataSource.initialize();

  console.log("Inserting a new user into the database...");

  const app: Express = express();
  const port = process.env.PORT;
  app.use(express.json());

  app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
  });

  // Meal routes
  app.use("/meals", mealRoutes());
  // Ingredients routes
  app.use("/ingredients", ingredientRoutes());

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}

main();
