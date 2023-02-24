import express, { Express, Request, Response } from 'express';

export default () => {
  const router = express.Router();

  router.get('/', (req, res) => res.send("Meal"))

  return router
}