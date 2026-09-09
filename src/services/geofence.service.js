const db = require('../config/database');

async function findZoneByPoint(lng, lat) {
  const zone = await db.raw(`
    SELECT id, name, adm_level, country_id, parent_id
    FROM zones
    WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint(?, ?), 4326))
    AND adm_level IN (2, 3)
    ORDER BY adm_level DESC
    LIMIT 1
  `, [lng, lat]);

  return zone.rows[0] || null;
}

async function findNearestZone(lng, lat) {
  const zone = await db.raw(`
    SELECT id, name, adm_level, country_id, parent_id,
      ST_Distance(boundary, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as distance_meters
    FROM zones
    WHERE adm_level = 2
    ORDER BY boundary <-> ST_SetSRID(ST_MakePoint(?, ?), 4326)::geometry
    LIMIT 1
  `, [lng, lat, lng, lat]);

  return zone.rows[0] || null;
}

async function assignZone(lng, lat) {
  let zone = await findZoneByPoint(lng, lat);
  
  if (!zone) {
    zone = await findNearestZone(lng, lat);
  }

  return zone ? zone.id : null;
}

module.exports = { findZoneByPoint, findNearestZone, assignZone };
