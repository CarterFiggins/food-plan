import knex, { Knex } from "knex";
import config from "./knexfile";

class Database {
  private static instance: Knex;

  private constructor() {}

  static getInstance(): Knex {
    if (!Database.instance) {
      Database.instance = knex(config.development);
    }
    return Database.instance;
  }
}

export default Database.getInstance();


