exports.seed = async function (knex) {
  await knex('countries').del();

  await knex('countries').insert([
    { iso_alpha3: 'CHL', iso_alpha2: 'CL', name: 'Chile', name_en: 'Chile', timezone: 'America/Santiago' },
    { iso_alpha3: 'ARG', iso_alpha2: 'AR', name: 'Argentina', name_en: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
    { iso_alpha3: 'PER', iso_alpha2: 'PE', name: 'Perú', name_en: 'Peru', timezone: 'America/Lima' },
    { iso_alpha3: 'MEX', iso_alpha2: 'MX', name: 'México', name_en: 'Mexico', timezone: 'America/Mexico_City' },
    { iso_alpha3: 'BRA', iso_alpha2: 'BR', name: 'Brasil', name_en: 'Brazil', timezone: 'America/Sao_Paulo' },
    { iso_alpha3: 'COL', iso_alpha2: 'CO', name: 'Colombia', name_en: 'Colombia', timezone: 'America/Bogota' },
    { iso_alpha3: 'ECU', iso_alpha2: 'EC', name: 'Ecuador', name_en: 'Ecuador', timezone: 'America/Guayaquil' },
    { iso_alpha3: 'VEN', iso_alpha2: 'VE', name: 'Venezuela', name_en: 'Venezuela', timezone: 'America/Caracas' },
    { iso_alpha3: 'BOL', iso_alpha2: 'BO', name: 'Bolivia', name_en: 'Bolivia', timezone: 'America/La_Paz' },
    { iso_alpha3: 'PRY', iso_alpha2: 'PY', name: 'Paraguay', name_en: 'Paraguay', timezone: 'America/Asuncion' },
    { iso_alpha3: 'URY', iso_alpha2: 'UY', name: 'Uruguay', name_en: 'Uruguay', timezone: 'America/Montevideo' },
    { iso_alpha3: 'PAN', iso_alpha2: 'PA', name: 'Panamá', name_en: 'Panama', timezone: 'America/Panama' },
    { iso_alpha3: 'ESP', iso_alpha2: 'ES', name: 'España', name_en: 'Spain', timezone: 'Europe/Madrid' },
    { iso_alpha3: 'FRA', iso_alpha2: 'FR', name: 'Francia', name_en: 'France', timezone: 'Europe/Paris' },
    { iso_alpha3: 'DEU', iso_alpha2: 'DE', name: 'Alemania', name_en: 'Germany', timezone: 'Europe/Berlin' },
    { iso_alpha3: 'ITA', iso_alpha2: 'IT', name: 'Italia', name_en: 'Italy', timezone: 'Europe/Rome' },
    { iso_alpha3: 'PRT', iso_alpha2: 'PT', name: 'Portugal', name_en: 'Portugal', timezone: 'Europe/Lisbon' },
    { iso_alpha3: 'GBR', iso_alpha2: 'GB', name: 'Reino Unido', name_en: 'United Kingdom', timezone: 'Europe/London' },
    { iso_alpha3: 'NLD', iso_alpha2: 'NL', name: 'Países Bajos', name_en: 'Netherlands', timezone: 'Europe/Amsterdam' },
    { iso_alpha3: 'AUS', iso_alpha2: 'AU', name: 'Australia', name_en: 'Australia', timezone: 'Australia/Sydney' },
    { iso_alpha3: 'NZL', iso_alpha2: 'NZ', name: 'Nueva Zelanda', name_en: 'New Zealand', timezone: 'Pacific/Auckland' },
  ]);
};
