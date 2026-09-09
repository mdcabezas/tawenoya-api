const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiReference } = require('@scalar/express-api-reference');
const passport = require('passport');
const { configurePassport } = require('./config/passport');
const errorHandler = require('./middlewares/errorHandler');
const { publicLimiter } = require('./middlewares/rateLimiter');

const authRoutes = require('./routes/auth.routes');
const reportRoutes = require('./routes/reports.routes');
const zoneRoutes = require('./routes/zones.routes');
const tagRoutes = require('./routes/tags.routes');
const countryRoutes = require('./routes/countries.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

configurePassport();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/reports', publicLimiter, reportRoutes);
app.use('/zones', publicLimiter, zoneRoutes);
app.use('/tags', publicLimiter, tagRoutes);
app.use('/countries', publicLimiter, countryRoutes);
app.use('/admin', adminRoutes);

app.use('/reference', apiReference({
  spec: { url: '/openapi.json' },
}));

app.get('/openapi.json', (req, res) => {
  res.json({
    openapi: '3.1.0',
    info: {
      title: 'Tawenoya API',
      version: '1.0.0',
      description: 'Civic reports API for urban infrastructure issues',
    },
    servers: [{ url: process.env.API_URL || 'http://localhost:3000' }],
    paths: {
      '/auth/google': {
        get: {
          summary: 'Google OAuth login',
          tags: ['Auth'],
          responses: { 302: { description: 'Redirect to Google' } },
        },
      },
      '/auth/google/callback': {
        get: {
          summary: 'Google OAuth callback',
          tags: ['Auth'],
          responses: { 200: { description: 'JWT token' } },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Get current user',
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'User data' } },
        },
      },
      '/reports': {
        get: {
          summary: 'List reports',
          tags: ['Reports'],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'tag', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'country', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Paginated reports' } },
        },
        post: {
          summary: 'Create report',
          tags: ['Reports'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['photo', 'lat', 'lng', 'description', 'tag_ids'],
                  properties: {
                    photo: { type: 'string', format: 'binary' },
                    lat: { type: 'number' },
                    lng: { type: 'number' },
                    description: { type: 'string', maxLength: 180 },
                    tag_ids: { type: 'array', items: { type: 'string', format: 'uuid' } },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Report created' } },
        },
      },
      '/reports/{id}': {
        get: {
          summary: 'Get report',
          tags: ['Reports'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Report data' } },
        },
      },
      '/reports/{id}/status': {
        patch: {
          summary: 'Update report status',
          tags: ['Reports'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['pending', 'reviewing', 'in_progress', 'resolved', 'rejected'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Report updated' } },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  });
});

app.use(errorHandler);

module.exports = app;
