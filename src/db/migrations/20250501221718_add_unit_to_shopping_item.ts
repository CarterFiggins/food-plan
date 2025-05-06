import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('item_unit', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().notNullable().unique().defaultTo(knex.raw("gen_random_uuid()"));
    table.float('amount').notNullable().defaultTo(0);
    table.string('unit').defaultTo('whole');
    table.uuid('shopping_item_id').references('id').inTable('shopping_item').onDelete('CASCADE');
    table.timestamps(true, true);
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('item_unit');
}

