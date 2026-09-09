exports.up = function (knex) {
  return knex.raw('CREATE TYPE user_role AS ENUM (\'user\', \'admin\', \'superadmin\')').then(() => {
    return knex.schema.createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('google_id').notNullable().unique();
      table.string('email').notNullable();
      table.string('name').notNullable();
      table.string('avatar_url');
      table.specificType('role', 'user_role').notNullable().defaultTo('user');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users').then(() => {
    return knex.raw('DROP TYPE IF EXISTS user_role');
  });
};
