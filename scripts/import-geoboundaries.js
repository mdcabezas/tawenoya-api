const db = require('../src/config/database');

const SUPPORTED_COUNTRIES = [
  { iso: 'CHL', levels: [1, 2] },
  { iso: 'ARG', levels: [1, 2] },
  { iso: 'PER', levels: [1, 2] },
  { iso: 'MEX', levels: [1, 2] },
  { iso: 'BRA', levels: [1, 2] },
  { iso: 'COL', levels: [1, 2] },
  { iso: 'ECU', levels: [1, 2] },
  { iso: 'VEN', levels: [1, 2] },
  { iso: 'BOL', levels: [1, 2] },
  { iso: 'PRY', levels: [1, 2] },
  { iso: 'URY', levels: [1, 2] },
  { iso: 'PAN', levels: [1, 2] },
  { iso: 'ESP', levels: [1, 2, 3] },
  { iso: 'FRA', levels: [1, 2] },
  { iso: 'DEU', levels: [1, 2] },
  { iso: 'ITA', levels: [1, 2] },
  { iso: 'PRT', levels: [1, 2] },
  { iso: 'GBR', levels: [1, 2] },
  { iso: 'NLD', levels: [1, 2] },
  { iso: 'AUS', levels: [1, 2] },
  { iso: 'NZL', levels: [1, 2] },
];

const GEOBOUNDARIES_API = 'https://www.geoboundaries.org/api/current/gbOpen';

async function importCountry(country) {
  console.log(`🌍 Importing ${country.iso}...`);

  const countryRecord = await db('countries').where('iso_alpha3', country.iso).first();
  if (!countryRecord) {
    console.log(`  ⚠️  Country ${country.iso} not found in database, skipping`);
    return;
  }

  for (const level of country.levels) {
    try {
      const url = `${GEOBOUNDARIES_API}/${country.iso}/ADM${level}/`;
      console.log(`  📥 Fetching ADM${level} from ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        console.log(`  ⚠️  Failed to fetch ADM${level} for ${country.iso}`);
        continue;
      }

      const data = await response.json();
      if (!data.gjDownloadURL) {
        console.log(`  ⚠️  No download link for ADM${level} of ${country.iso}`);
        continue;
      }

      const geoResponse = await fetch(data.gjDownloadURL);
      if (!geoResponse.ok) {
        console.log(`  ⚠️  Failed to download GeoJSON for ${country.iso} ADM${level}`);
        continue;
      }

      const geojson = await geoResponse.json();
      const zones = [];

      for (const feature of geojson.features) {
        const props = feature.properties;
        const name = props.shapeName || props.name || props.NAME || 'Unknown';
        const externalCode = props.shapeISO || props.iso_3166_2 || props.ADM1_PCODE || '';

        zones.push({
          country_id: countryRecord.id,
          external_code: externalCode,
          adm_level: level,
          name: name,
          parent_id: null,
          boundary: db.raw(`ST_GeomFromGeoJSON('${JSON.stringify(feature.geometry)}')`),
        });
      }

      if (zones.length > 0) {
        await db('zones').insert(zones);
        console.log(`  ✅ ADM${level}: ${zones.length} zones imported`);
      }
    } catch (error) {
      console.error(`  ❌ Error importing ${country.iso} ADM${level}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting geoBoundaries import...\n');

  for (const country of SUPPORTED_COUNTRIES) {
    await importCountry(country);
  }

  const [count] = await db('zones').count('* as total');
  console.log(`\n✨ Import complete! Total zones: ${count.total}`);

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
