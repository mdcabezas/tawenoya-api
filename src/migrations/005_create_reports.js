exports.up = function (knex) {
  return knex.raw("CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'in_progress', 'resolved', 'rejected')").then(() => {
    return knex.schema.createTable('reports', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('photo_url_thumb');
      table.string('photo_url_original');
      table.specificType('location', 'GEOGRAPHY(POINT, 4326)');
      table.string('description', 180).notNullable();
      table.specificType('status', 'report_status').notNullable().defaultTo('pending');
      table.uuid('zone_id').references('id').inTable('zones').onDelete('SET NULL');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index('user_id');
      table.index('zone_id');
      table.index('status');
    }).then(() => {
      return knex.raw('CREATE INDEX idx_reports_location ON reports USING GIST(location)');
    });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('reports').then(() => {
    return knex.raw('DROP TYPE IF EXISTS report_status');
  });
};
