exports.up = function (knex) {
  return knex.schema.createTable('countries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('iso_alpha3', 3).notNullable().unique();
    table.string('iso_alpha2', 2).notNullable().unique();
    table.string('name').notNullable();
    table.string('name_en').notNullable();
    table.string('timezone').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('countries');
};
