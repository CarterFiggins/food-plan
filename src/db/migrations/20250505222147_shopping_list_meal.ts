import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('meal_shopping_list', (table: Knex.TableBuilder) => {
    table.uuid('meal_id').references('id').inTable('meal').onDelete('CASCADE');
    table.uuid('shopping_list_id').references('id').inTable('shopping_list').onDelete('CASCADE');
    table.timestamps(true, true);
    table.primary(['meal_id', 'shopping_list_id']);
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('meal_shopping_list');
}

