import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('shopping_item', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().notNullable().unique().defaultTo(knex.raw("gen_random_uuid()"));
    table.boolean('is_checked').defaultTo(false);
    table.uuid('shopping_list_id').references('id').inTable('shopping_list').onDelete('CASCADE');
    table.uuid('ingredient_id').references('id').inTable('ingredient').onDelete('CASCADE');
    table.timestamps(true, true);
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('shopping_item');
}

