const express = require('express');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/role');
const db = require('../config/database');

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', requireRole('admin'), async (req, res, next) => {
  try {
    const { from, to } = req.query;

    let reportQuery = db('reports');

    if (from) {
      reportQuery = reportQuery.where('created_at', '>=', from);
    }
    if (to) {
      reportQuery = reportQuery.where('created_at', '<=', to);
    }

    const [totalReports] = await reportQuery.clone().count('* as total');
    const [totalUsers] = await db('users').count('* as total');

    const reportsByStatus = await reportQuery.clone()
      .select('status')
      .count('* as count')
      .groupBy('status');

    const reportsByCountry = await reportQuery.clone()
      .join('zones', 'reports.zone_id', 'zones.id')
      .join('countries', 'zones.country_id', 'countries.id')
      .select('countries.iso_alpha3 as country_code', 'countries.name as country_name')
      .count('* as count')
      .groupBy('countries.id', 'countries.iso_alpha3', 'countries.name')
      .orderBy('count', 'desc');

    res.json({
      total_reports: parseInt(totalReports.total),
      total_users: parseInt(totalUsers.total),
      reports_by_status: reportsByStatus.map((r) => ({ status: r.status, count: parseInt(r.count) })),
      reports_by_country: reportsByCountry.map((r) => ({
        country_code: r.country_code,
        country_name: r.country_name,
        count: parseInt(r.count),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users', requireRole('superadmin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [countResult] = await db('users').count('* as total');
    const total = parseInt(countResult.total);

    const users = await db('users')
      .select('id', 'email', 'name', 'role', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json({
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id', requireRole('superadmin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'admin', 'superadmin'];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: `role is required and must be one of: ${validRoles.join(', ')}` });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const [user] = await db('users')
      .where('id', req.params.id)
      .update({ role, updated_at: db.fn.now() })
      .returning(['id', 'email', 'name', 'role']);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', requireRole('superadmin'), async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const deleted = await db('users').where('id', req.params.id).del();

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
