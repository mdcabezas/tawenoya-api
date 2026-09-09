## 1. Project Setup

- [x] 1.1 Initialize npm project with `npm init -y` and verify package.json is created
- [x] 1.2 Create project directory structure: src/{config,middlewares,routes,controllers,services,validators,migrations,seeds} and verify directories exist
- [x] 1.3 Install production dependencies (express, knex, pg, passport, passport-google-oauth20, jsonwebtoken, @aws-sdk/client-s3, sharp, multer, cors, helmet, dotenv, express-rate-limit, @scalar/express-api-reference, uuid) and verify package.json lists them
- [x] 1.4 Install dev dependencies (nodemon, eslint) and verify package.json lists them
- [x] 1.5 Create .env.example with all required environment variables (DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, SEAWEEDFS_*, PORT) and verify file exists
- [x] 1.6 Create knexfile.js with development/production configurations and verify it exports correctly

## 2. Docker Configuration

- [x] 2.1 Create Dockerfile with Node.js 20 base, app copy, npm install, and CMD and verify `docker build` succeeds
- [x] 2.2 Create docker-compose.yml with services: api, postgres (postgis/postgis:16-3.4), seaweedfs (chrislusf/seaweedfs) and verify `docker-compose config` validates
- [x] 2.3 Create docker/seaweedfs-config.json with anonymous read + tawenoya-api admin credentials and verify JSON is valid
- [x] 2.4 Test full stack startup with `docker-compose up` and verify all 3 services start without errors

## 3. Database Configuration

- [x] 3.1 Create src/config/database.js exporting Knex instance configured from knexfile.js and verify it connects to PostgreSQL
- [x] 3.2 Create migration 001_create_countries.js with id, iso_alpha3 (unique), iso_alpha2 (unique), name, name_en, timezone, is_active, created_at and verify migration runs
- [x] 3.3 Create migration 002_create_zones.js with id, country_id (FK), external_code, adm_level, name, parent_id (self-FK), boundary (GEOGRAPHY), created_at, plus GIST index on boundary and composite index on (country_id, adm_level) and verify migration runs
- [x] 3.4 Create migration 003_create_users.js with id (UUID), google_id (unique), email, name, avatar_url, role (ENUM user/admin/superadmin), created_at, updated_at and verify migration runs
- [x] 3.5 Create migration 004_create_tags.js with id (UUID), name (unique), icon, is_active, created_at and verify migration runs
- [x] 3.6 Create migration 005_create_reports.js with id (UUID), user_id (FK), photo_url_thumb, photo_url_original, location (GEOGRAPHY POINT 4326), description (VARCHAR 180), status (ENUM), zone_id (FK), created_at, updated_at, plus GIST index on location and index on zone_id and verify migration runs
- [x] 3.7 Create migration 006_create_report_tags.js with composite PK (report_id, tag_id) and verify migration runs

## 4. Authentication

- [x] 4.1 Create src/config/passport.js with Google OAuth20 strategy using findOrCreate logic and verify it registers with Passport
- [x] 4.2 Create src/middlewares/auth.js implementing JWT verification middleware (extract Bearer token, verify with jsonwebtoken, attach user to req) and verify it rejects invalid tokens with 401
- [x] 4.3 Create src/middlewares/role.js implementing role-based middleware factory (requireRole('admin'), requireRole('superadmin')) and verify it rejects unauthorized roles with 403
- [x] 4.4 Create src/routes/auth.routes.js with GET /google (redirect to Google), GET /google/callback (handle callback, issue JWT), GET /me (return current user) and verify routes are mountable
- [x] 4.5 Create src/controllers/auth.controller.js implementing Google OAuth flow, JWT issuance (24h expiry, payload: id, email, role), and getMe and verify JWT contains correct payload

## 5. Reports CRUD

- [x] 5.1 Create src/validators/report.validator.js with Joi/Zod schemas for create (photo, lat, lng, description 180chars, tag_ids[]) and update status (pending/reviewing/in_progress/resolved/rejected) and verify validation errors are descriptive
- [x] 5.2 Create src/routes/reports.routes.js with POST / (auth required), GET / (public), GET /:id (public), PATCH /:id/status (admin), DELETE /:id (auth, owner only) and verify routes are mountable
- [x] 5.3 Create src/controllers/report.controller.js implementing createReport (validate, process image, upload to S3, spatial zone assignment, insert with tags), listReports (pagination, filters: tag, status, country, date range, radius), getReport, updateReportStatus, deleteReport and verify each endpoint returns correct status codes

## 6. Image Processing

- [x] 6.1 Create src/services/image.service.js with processImage(fileBuffer) that generates thumb (800px, 80% WebP, ~50-100KB) and original (2048px, 90% WebP, ~300-600KB) using Sharp, maintaining aspect ratio, auto-orienting, and returning {reportId, thumb, original} buffers and verify output dimensions and formats are correct

## 7. Storage Integration

- [x] 7.1 Create src/services/s3.service.js configuring AWS S3 client pointed to SeaweedFS (endpoint, access key, secret from env), implementing uploadFile(key, buffer, contentType), deleteFile(key), getSignedUrl(key, expiry) and verify upload succeeds to SeaweedFS
- [x] 7.2 Integrate S3 service into report.controller.js upload flow: generate UUID path (reports/{uuid}/thumb.webp, reports/{uuid}/original.webp), upload both versions, store public URLs in DB and verify images are accessible via SeaweedFS public endpoint

## 8. Geofencing

- [x] 8.1 Create src/services/geofence.service.js implementing findZoneByPoint(lng, lat) using PostGIS ST_Contains query (adm_level IN 2,3, ORDER BY adm_level DESC LIMIT 1), and findNearestZone(lng, lat) fallback using <-> operator and verify it returns correct zone for known coordinates

## 9. Zones Management

- [x] 9.1 Create src/routes/zones.routes.js with GET / (list with filters: country, adm_level, search), GET /:id (detail), GET /:id/reports (reports in zone), POST / (superadmin), PUT /:id (superadmin), DELETE /:id (superadmin) and verify routes are mountable
- [x] 9.2 Create src/controllers/zone.controller.js implementing listZones, getZone (with parent/children), getZoneReports (paginated), createZone, updateZone, deleteZone and verify spatial queries work correctly

## 10. Tags Management

- [x] 10.1 Create src/routes/tags.routes.js with GET / (list active), POST / (superadmin), PUT /:id (superadmin), DELETE /:id (superadmin) and verify routes are mountable
- [x] 10.2 Create src/controllers/tag.controller.js implementing listTags (active only, include_inactive for superadmin), createTag (unique name validation), updateTag, deleteTag (check no reports use it) and verify cascade rules work

## 11. Countries

- [x] 11.1 Create src/routes/countries.routes.js with GET / (list all), GET /:iso (detail with zone counts), GET /:iso/zones (zones by country) and verify routes are mountable
- [x] 11.2 Create src/controllers/country.controller.js implementing listCountries, getCountryByIso, getCountryZones and verify it joins zones correctly

## 12. Admin

- [x] 12.1 Create src/routes/admin.routes.js with GET /stats, GET /users (superadmin), PATCH /users/:id (superadmin), DELETE /users/:id (superadmin) and verify routes are mountable
- [x] 12.2 Create src/controllers/admin.controller.js implementing getStats (aggregate reports by status, by country, total users), listUsers (paginated), updateUserRole (superadmin only, cannot change own role), deactivateUser and verify stats return correct aggregates

## 13. Seed Data

- [x] 13.1 Create seeds/001_countries.js inserting 21 supported countries with ISO codes, names, timezones and verify all 21 countries are inserted
- [x] 13.2 Create seeds/002_tags.js inserting default tags (veredas, calles, basureros, juegos_infantiles, parques, alumbrado, baches, etc.) with icons and verify all tags are inserted
- [x] 13.3 Create scripts/import-geoboundaries.js that downloads ADM1+ADM2 polygons for all 21 countries from geoBoundaries API, converts GeoJSON to PostGIS geography, and inserts into zones table with parent_id resolution and verify ~13,000 zones are imported

## 14. Middleware & Error Handling

- [x] 14.1 Create src/middlewares/errorHandler.js implementing global error handler (catch all, return structured JSON error, log stack trace in development) and verify unhandled errors return 500 with error message
- [x] 14.2 Create src/middlewares/rateLimiter.js configuring express-rate-limit with different limits: 60/min public, 10/min authenticated POST, 30/min admin and verify 429 responses are returned when exceeded

## 15. App Assembly

- [x] 15.1 Create src/app.js importing all routes, mounting them (/auth, /reports, /zones, /tags, /countries, /admin, /reference), adding middleware (helmet, cors, json, static), configuring Scalar at /reference, mounting error handler and verify app starts without errors
- [x] 15.2 Create src/server.js as entry point (load dotenv, import app, listen on PORT) and verify server starts on configured port

## 16. OpenAPI Documentation

- [x] 16.1 Create openapi.json or inline OpenAPI spec defining all endpoints, request/response schemas, authentication requirements, and error responses and verify Scalar renders documentation at /reference

## 17. Package Scripts

- [x] 17.1 Add npm scripts to package.json: "start", "dev" (nodemon), "migrate", "migrate:rollback", "seed", "seed:run" and verify `npm run dev` starts the server

## 18. Final Verification

- [x] 18.1 Run `docker-compose up` and verify all 3 services (api, postgres, seaweedfs) start and connect successfully
- [x] 18.2 Run migrations and seeds, verify database has tables and seed data (21 countries, ~13,000 zones, default tags)
- [x] 18.3 Test complete flow: register via Google OAuth, create report with photo, verify zone auto-assignment, verify image upload to SeaweedFS, verify thumb/original URLs accessible
- [x] 18.4 Test admin flow: update report status, verify role-based access control
- [x] 18.5 Verify Scalar API documentation loads at http://localhost:3000/reference
