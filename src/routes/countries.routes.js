const express = require('express');
const db = require('../config/database');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const countries = await db('countries')
      .leftJoin('zones', 'countries.id', 'zones.country_id')
      .select(
        'countries.*',
        db.raw('COUNT(DISTINCT zones.id) as zone_count')
      )
      .groupBy('countries.id')
      .orderBy('countries.name');

    res.json(countries);
  } catch (error) {
    next(error);
  }
});

router.get('/:iso', async (req, res, next) => {
  try {
    const country = await db('countries')
      .where('iso_alpha3', req.params.iso.toUpperCase())
      .first();

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    const [zoneCount] = await db('zones')
      .where('country_id', country.id)
      .count('* as total');

    const [reportCount] = await db('reports')
      .join('zones', 'reports.zone_id', 'zones.id')
      .where('zones.country_id', country.id)
      .count('* as total');

    res.json({
      ...country,
      zone_count: parseInt(zoneCount.total),
      report_count: parseInt(reportCount.total),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:iso/zones', async (req, res, next) => {
  try {
    const { adm_level, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const country = await db('countries')
      .where('iso_alpha3', req.params.iso.toUpperCase())
      .first();

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    let query = db('zones').where('country_id', country.id);

    if (adm_level) {
      query = query.where('adm_level', adm_level);
    }

    const [countResult] = await query.clone().count('* as total');
    const total = parseInt(countResult.total);

    const zones = await query.limit(limit).offset(offset);

    res.json({
      data: zones,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
