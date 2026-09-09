exports.up = function (knex) {
  return knex.schema.createTable('report_tags', (table) => {
    table.uuid('report_id').notNullable().references('id').inTable('reports').onDelete('CASCADE');
    table.uuid('tag_id').notNullable().references('id').inTable('tags').onDelete('CASCADE');
    table.primary(['report_id', 'tag_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('report_tags');
};
