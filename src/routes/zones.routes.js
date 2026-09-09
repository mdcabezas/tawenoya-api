const express = require('express');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/role');
const db = require('../config/database');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { country, adm_level, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('zones').select('zones.*', 'countries.iso_alpha3 as country_code')
      .join('countries', 'zones.country_id', 'countries.id');

    if (country) {
      query = query.where('countries.iso_alpha3', country);
    }

    if (adm_level) {
      query = query.where('adm_level', adm_level);
    }

    if (search) {
      query = query.whereILike('name', `%${search}%`);
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

router.get('/:id', async (req, res, next) => {
  try {
    const zone = await db('zones')
      .leftJoin('countries', 'zones.country_id', 'countries.id')
      .leftJoin('zones as parent', 'zones.parent_id', 'parent.id')
      .where('zones.id', req.params.id)
      .select('zones.*', 'countries.iso_alpha3 as country_code', 'parent.name as parent_name')
      .first();

    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    const children = await db('zones')
      .where('parent_id', req.params.id)
      .select('id', 'name', 'adm_level');

    const [reportCount] = await db('reports')
      .where('zone_id', req.params.id)
      .count('* as total');

    res.json({ ...zone, children, report_count: parseInt(reportCount.total) });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/reports', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [countResult] = await db('reports')
      .where('zone_id', req.params.id)
      .count('* as total');
    const total = parseInt(countResult.total);

    const reports = await db('reports')
      .where('zone_id', req.params.id)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json({
      data: reports,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { name, country_id, adm_level, parent_id, boundary } = req.body;

    if (!name || !country_id || !adm_level || !boundary) {
      return res.status(400).json({ error: 'name, country_id, adm_level, and boundary are required' });
    }

    const [zone] = await db('zones')
      .insert({
        name,
        country_id,
        adm_level,
        parent_id: parent_id || null,
        boundary: db.raw(`ST_GeomFromGeoJSON('${JSON.stringify(boundary)}')`),
      })
      .returning('*');

    res.status(201).json(zone);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { name, parent_id, boundary } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (parent_id !== undefined) updates.parent_id = parent_id;
    if (boundary) {
      updates.boundary = db.raw(`ST_GeomFromGeoJSON('${JSON.stringify(boundary)}')`);
    }

    updates.updated_at = db.fn.now();

    const [zone] = await db('zones')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');

    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    res.json(zone);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, requireRole('superadmin'), async (req, res, next) => {
  try {
    const deleted = await db('zones').where('id', req.params.id).del();

    if (!deleted) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
