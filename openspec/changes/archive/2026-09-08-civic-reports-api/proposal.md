## Why

Existe la necesidad de una plataforma ciudadana para reportar problemas de infraestructura urbana (veredas en mal estado, basureros rotos, juegos infantiles defectuosos, etc.) de manera simple y geolocalizada. Los municipios y gobiernos locales carecen de herramientas accesibles para recibir feedback directo de los ciudadanos sobre el estado de la vía pública. Una API minimalista que permita subir fotos geolocalizadas con descripción breve y etiquetas facilita la creación de apps móviles y web para este fin.

## What Changes

- **API REST completa** para crear, consultar y gestionar reportes ciudadanos de mejoras en la vía pública
- **Autenticación OAuth** con Google para identificar usuarios
- **Almacenamiento dual de imágenes** con versiones thumb (800px, 80%) y original (2048px, 90%) en WebP
- **Geocodificación automática** que asigna zona administrativa (comuna/distrito/municipio) según coordenadas GPS usando PostGIS
- **Sistema de geocercas** basado en geoBoundaries con 21 países soportados (Latinoamérica, Europa, Oceanía)
- **Sistema de etiquetas** administrado por superadmin para categorizar reportes
- **Gestión de estados** de reportes (pending, reviewing, in_progress, resolved, rejected) con roles user/admin/superadmin
- **Documentación API** interactiva con Scalar
- **Containerización** con Docker + Docker Compose incluyendo PostgreSQL/PostGIS y SeaweedFS
- **Rate limiting** para proteger endpoints públicos y autenticados

## Capabilities

### New Capabilities

- `civic-reports/reports`: CRUD de reportes ciudadanos con upload de fotos dual (thumb/original), validación, paginación y filtros avanzados (tags, status, rango fechas, distancia, país/zona)
- `civic-reports/auth`: Autenticación OAuth2 con Google, emisión de JWT, gestión de sesiones y roles (user/admin/superadmin)
- `civic-reports/zones`: Sistema de geocercas con 21 países usando geoBoundaries, consulta espacial PostGIS ST_Contains para auto-asignación de zonas
- `civic-reports/tags`: CRUD de etiquetas administrables por superadmin para categorizar reportes
- `civic-reports/image-processing`: Servicio de procesamiento dual de imágenes con Sharp (thumb 800px/80% + original 2048px/90% en WebP)
- `civic-reports/storage`: Integración con SeaweedFS (S3-compatible) para almacenamiento de imágenes
- `civic-reports/admin`: Panel de administración con estadísticas, gestión de usuarios y cambio de roles

### Modified Capabilities

<!-- No hay capacidades existentes, es un proyecto nuevo -->

## Impact

- **Código nuevo**: Sistema completo de API desde cero (no hay código existente)
- **Dependencias npm**: express, knex, pg, passport, passport-google-oauth20, jsonwebtoken, @aws-sdk/client-s3, sharp, multer, cors, helmet, dotenv, express-rate-limit, @scalar/express-api-reference, uuid
- **Infraestructura**: Docker Compose con servicios api, postgres (PostGIS), seaweedfs
- **Base de datos**: PostgreSQL 16 + PostGIS 3.4 con tablas countries, zones, users, tags, reports, report_tags
- **Datos iniciales**: Seed data de 21 países con ~13,000 zonas administrativas descargadas de geoBoundaries
- **API pública**: Endpoints REST para auth, reports, zones, countries, tags, admin
- **Documentación**: Scalar API Reference en /reference
