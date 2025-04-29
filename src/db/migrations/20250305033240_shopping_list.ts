import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('shopping_list', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().notNullable().unique().defaultTo(knex.raw("gen_random_uuid()"));
    table.string('name').nullable();
    table.boolean('is_favorite');
    table.timestamps(true, true);
  })
}


export async function down(knex: Knex): Promise<void> {
}

