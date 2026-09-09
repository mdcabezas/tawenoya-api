const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/role');
const { createReportSchema, updateStatusSchema } = require('../validators/report.validator');
const { processImage } = require('../services/image.service');
const { uploadFile, deleteFile } = require('../services/s3.service');
const { assignZone } = require('../services/geofence.service');
const db = require('../config/database');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', authMiddleware, upload.single('photo'), async (req, res, next) => {
  try {
    const validation = createReportSchema.validate(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Photo is required' });
    }

    const { reportId, thumb, original } = await processImage(req.file.buffer);

    const thumbKey = `reports/${reportId}/thumb.webp`;
    const originalKey = `reports/${reportId}/original.webp`;

    const thumbUrl = await uploadFile(thumbKey, thumb, 'image/webp');
    const originalUrl = await uploadFile(originalKey, original, 'image/webp');

    const zoneId = await assignZone(parseFloat(req.body.lng), parseFloat(req.body.lat));

    const [report] = await db('reports')
      .insert({
        user_id: req.user.id,
        photo_url_thumb: thumbUrl,
        photo_url_original: originalUrl,
        location: db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [req.body.lng, req.body.lat]),
        description: req.body.description,
        zone_id: zoneId,
        status: 'pending',
      })
      .returning('*');

    if (req.body.tag_ids && req.body.tag_ids.length > 0) {
      const reportTags = req.body.tag_ids.map((tagId) => ({
        report_id: report.id,
        tag_id: tagId,
      }));
      await db('report_tags').insert(reportTags);
    }

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, tag, status, country, from, to, lat, lng, radius } = req.query;
    const offset = (page - 1) * limit;

    let query = db('reports')
      .select('reports.*')
      .orderBy('created_at', 'desc');

    if (status) {
      query = query.where('status', status);
    }

    if (from) {
      query = query.where('created_at', '>=', from);
    }

    if (to) {
      query = query.where('created_at', '<=', to);
    }

    if (tag) {
      query = query.join('report_tags', 'reports.id', 'report_tags.report_id')
        .join('tags', 'report_tags.tag_id', 'tags.id')
        .where('tags.name', tag);
    }

    if (country) {
      query = query.join('zones', 'reports.zone_id', 'zones.id')
        .join('countries', 'zones.country_id', 'countries.id')
        .where('countries.iso_alpha3', country);
    }

    if (lat && lng && radius) {
      query = query.whereRaw(
        'ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) < ?',
        [lng, lat, radius]
      );
    }

    const countQuery = db('reports');
    if (status) countQuery.where('status', status);
    if (from) countQuery.where('created_at', '>=', from);
    if (to) countQuery.where('created_at', '<=', to);
    if (tag) {
      countQuery.join('report_tags', 'reports.id', 'report_tags.report_id')
        .join('tags', 'report_tags.tag_id', 'tags.id')
        .where('tags.name', tag);
    }
    if (country) {
      countQuery.join('zones', 'reports.zone_id', 'zones.id')
        .join('countries', 'zones.country_id', 'countries.id')
        .where('countries.iso_alpha3', country);
    }
    if (lat && lng && radius) {
      countQuery.whereRaw(
        'ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) < ?',
        [lng, lat, radius]
      );
    }
    const [countResult] = await countQuery.count('* as total');
    const total = parseInt(countResult.total);

    const reports = await query.limit(limit).offset(offset);

    res.json({
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const report = await db('reports')
      .leftJoin('zones', 'reports.zone_id', 'zones.id')
      .leftJoin('countries', 'zones.country_id', 'countries.id')
      .where('reports.id', req.params.id)
      .select('reports.*', 'zones.name as zone_name', 'countries.iso_alpha3 as country_code')
      .first();

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const tags = await db('tags')
      .join('report_tags', 'tags.id', 'report_tags.tag_id')
      .where('report_tags.report_id', req.params.id)
      .select('tags.id', 'tags.name', 'tags.icon');

    res.json({ ...report, tags });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const validation = updateStatusSchema.validate(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const [report] = await db('reports')
      .where('id', req.params.id)
      .update({ status: req.body.status, updated_at: db.fn.now() })
      .returning('*');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const report = await db('reports').where('id', req.params.id).first();

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Cannot delete other users\' reports' });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({ error: 'Can only delete pending reports' });
    }

    const thumbKey = `reports/${report.id}/thumb.webp`;
    const originalKey = `reports/${report.id}/original.webp`;

    await deleteFile(thumbKey).catch(() => {});
    await deleteFile(originalKey).catch(() => {});

    await db('reports').where('id', req.params.id).del();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
