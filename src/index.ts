import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import mealRoutes from '../routes/meals'
import "reflect-metadata"
import { AppDataSource } from "./data-source"

dotenv.config();

async function main() {

  await AppDataSource.initialize()

  console.log("Inserting a new user into the database...")
  // const user = new User()
  // user.firstName = "Timber"
  // user.lastName = "Saw"
  // user.age = 25
  // await AppDataSource.manager.save(user)
  // console.log("Saved a new user with id: " + user.id)

  // console.log("Loading users from the database...")
  // const users = await AppDataSource.manager.find(User)
  // console.log("Loaded users: ", users)
  
  const app: Express = express();
  const port = process.env.PORT;
  
  app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
  });

  // Meal routes
  app.use('/meals', mealRoutes())
  
  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}

main()
