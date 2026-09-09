exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE zones
    ALTER COLUMN boundary TYPE geometry(Geometry, 4326)
    USING boundary::geometry
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE zones
    ALTER COLUMN boundary TYPE geometry(Polygon, 4326)
    USING ST_CollectionExtract(boundary::geometry, 3)
  `);
};
