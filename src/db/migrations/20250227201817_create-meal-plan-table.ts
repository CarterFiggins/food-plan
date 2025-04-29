import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('meal_plan', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().notNullable().unique().defaultTo(knex.raw("gen_random_uuid()"));
    table.integer('position').notNullable().unique();
    table.boolean('meal_created').defaultTo(false);
    table.uuid('meal_id').references('id').inTable('meal');
    table.timestamps(true, true);
  })
}


export async function down(knex: Knex): Promise<void> {
}

