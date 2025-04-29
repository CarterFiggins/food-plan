import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('meal', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().notNullable().unique().defaultTo(knex.raw("gen_random_uuid()"));
    table.string('name').nullable();
    table.timestamps(true, true);
  })
}


export async function down(knex: Knex): Promise<void> {
}

