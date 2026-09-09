const express = require('express');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/role');
const db = require('../config/database');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { include_inactive } = req.query;

    let query = db('tags');

    if (include_inactive !== 'true') {
      query = query.where('is_active', true);
    }

    const tags = await query.orderBy('name');

    res.json(tags);
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { name, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const existing = await db('tags').where({ name }).first();
    if (existing) {
      return res.status(409).json({ error: 'Tag name already exists' });
    }

    const [tag] = await db('tags')
      .insert({ name, icon, is_active: true })
      .returning('*');

    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { name, icon, is_active } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (icon !== undefined) updates.icon = icon;
    if (is_active !== undefined) updates.is_active = is_active;

    const [tag] = await db('tags')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, requireRole('superadmin'), async (req, res, next) => {
  try {
    const [reportCount] = await db('report_tags')
      .where('tag_id', req.params.id)
      .count('* as total');

    if (parseInt(reportCount.total) > 0) {
      return res.status(409).json({ error: 'Cannot delete tag in use by reports' });
    }

    const deleted = await db('tags').where('id', req.params.id).del();

    if (!deleted) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
