import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mealRoutes from "./routes/meals";
import ingredientRoutes from "./routes/ingredients";
import mealPlanRoutes from "./routes/meal_plans";
import shoppingListRoutes from "./routes/shopping_list";
import shoppingItemRoutes from "./routes/shopping_item";

dotenv.config();

async function main() {
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
  // MealPlans routes
  app.use("/meal-plan", mealPlanRoutes());

  app.use("/shopping-list", shoppingListRoutes());

  app.use("/shopping-item", shoppingItemRoutes());

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}

main();
