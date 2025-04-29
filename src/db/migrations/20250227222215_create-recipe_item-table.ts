import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('recipe_item', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().notNullable().unique().defaultTo(knex.raw("gen_random_uuid()"));
    table.float('amount').notNullable();
    table.string('unit');
    table.uuid('meal_id').references('id').inTable('meal');
    table.uuid('ingredient_id').references('id').inTable('ingredient');
    table.timestamps(true, true);
  })
}


export async function down(knex: Knex): Promise<void> {
}

