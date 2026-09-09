exports.up = function (knex) {
  return knex.schema.createTable('zones', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('country_id').notNullable().references('id').inTable('countries').onDelete('CASCADE');
    table.string('external_code');
    table.integer('adm_level').notNullable();
    table.string('name').notNullable();
    table.uuid('parent_id').references('id').inTable('zones').onDelete('SET NULL');
    table.specificType('boundary', 'GEOGRAPHY(POLYGON, 4326)');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index(['country_id', 'adm_level']);
    table.index('parent_id');
  }).then(() => {
    return knex.raw('CREATE INDEX idx_zones_boundary ON zones USING GIST(boundary)');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('zones');
};
