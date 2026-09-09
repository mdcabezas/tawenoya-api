## Context

Proyecto nuevo desde cero (repositorio vacío excepto .opencode/ y openspec/). Se requiere una API REST para reportes ciudadanos de infraestructura urbana con:

- Autenticación OAuth2 (Google)
- PostgreSQL + PostGIS para geodatos
- SeaweedFS para almacenamiento de imágenes (S3-compatible)
- Sharp para procesamiento dual de imágenes (thumb + original)
- Docker para containerización
- geoBoundaries como fuente de datos geográficos para 21 países
- Scalar para documentación API

## Goals / Non-Goals

**Goals:**
- API REST minimalista y funcional para crear/consultar/gestionar reportes
- Soporte multi-país con geocercas (21 países: Latam, Europa, Oceanía)
- Imágenes duales: thumb (800px, 80%, WebP) + original (2048px, 90%, WebP)
- Autenticación segura con Google OAuth2 + JWT
- Roles: user → admin → superadmin
- Containerización completa con Docker Compose
- Documentación interactiva con Scalar

**Non-Goals:**
- Frontend/móvil (solo API)
- Notificaciones push/email
- Pagos o monetización
- Moderación de contenido con IA
- Analytics avanzados
- Multi-tenant
- Clustering/Kubernetes
- CI/CD (se puede agregar después)
- Testing automatizado (se puede agregar después)

## Decisions

### 1. Stack: Express.js + JavaScript (sin TypeScript)

**Decisión:** Express.js 4.x con JavaScript puro, sin TypeScript.

**Alternativas consideradas:**
- TypeScript: Más seguro pero agrega complejidad de compilación, no es requerimiento del usuario
- Fastify: Más rápido pero menor ecosistema, Express es más conocido

**Razón:** El usuario especificó JavaScript puro. Express tiene el ecosistema más maduro y es ampliamente documentado.

### 2. Query Builder: Knex.js

**Decisión:** Usar Knex.js para migraciones y queries, no solo raw SQL.

**Alternativas consideradas:**
- Prisma: Más moderno pero más pesado, genera código
- Raw SQL: Más control pero más trabajo manual
- Sequelize: Más antiguo, menos flexible con PostGIS

**Razón:** Knex tiene soporte nativo para PostGIS (`table.geography()`), migraciones integradas, y es ligero. Permite raw SQL cuando es necesario.

### 3. Base de datos: PostgreSQL 16 + PostGIS 3.4

**Decisión:** PostgreSQL con extensión PostGIS para datos geoespaciales.

**Alternativas consideradas:**
- MySQL + spatial: Menor soporte geoespacial
- MongoDB + GeoJSON: Menos consistente para joins complejos
- SQLite: No soporta PostGIS nativo

**Razón:** PostGIS es el estándar para datos geoespaciales. ST_Contains, ST_Distance, y índices GIST son esenciales para geocercas.

### 4. Auth: Passport.js + Google OAuth20 + JWT

**Decisión:** Passport.js con estrategia Google OAuth20, emisión de JWT para sesiones stateless.

**Alternativas consideradas:**
- Auth0/Cognito: Servicio externo, más caro, menos control
- Sessions: Requiere estado en servidor, no escala bien
- Firebase Auth: Vendor lock-in

**Razón:** Google OAuth es el requerimiento del usuario. JWT permite escalar sin estado server-side. Passport.js es el estándar en Express.

### 5. Almacenamiento: SeaweedFS

**Decisión:** SeaweedFS como almacenamiento S3-compatible, desplegado en Docker.

**Alternativas consideradas:**
- AWS S3: Requiere cuenta AWS, costos variables
- MinIO: Repo archivado según usuario
- Local filesystem: No escala, pierde datos en recrear container

**Razón:** SeaweedFS es activo, compatible con S3 API, funciona en Docker, sin costos cloud. El usuario confirmó que MinIO no es opción.

### 6. Imágenes: WebP dual (thumb + original)

**Decisión:** Generar dos versiones en WebP: thumb (800px, 80%) y original (2048px, 90%).

**Alternativas consideradas:**
- JPEG: Más compatible pero 25-35% más grande
- PNG: Sin pérdida pero archivos enormes
- Solo una versión: Menos flexible para diferentes contextos

**Razón:** WebP tiene soporte del 97% de navegadores, mejor compresión. Dos versiones permiten carga rápida en listados y buena calidad en descargas.

### 7. Geodatos: geoBoundaries (fuente unificada)

**Decisión:** Usar geoBoundaries como fuente para todos los 21 países.

**Alternativas consideradas:**
- Fuentes oficiales por país: Más precisas pero más mantenimiento
- Natural Earth: Solo nivel país y estado, no municipios
- OpenStreetMap: Completo pero inconsistente

**Razón:** geoBoundaries ofrece API REST, formato consistente, licencia abierta (CC BY 4.0), y cubre 200+ países. La consistencia supera la precisión marginal para una app de reportes ciudadanos.

### 8. Rate Limiting: express-rate-limit

**Decisión:** express-rate-limit con memory store para rate limiting.

**Alternativas consideradas:**
- Redis store: Más robusto pero requiere otro servicio
- Slow requests: Menos configurable
- Helmet rateLimit: Ya incluido en helmet

**Razón:** Simple, suficiente para MVP. Redis se puede agregar después para clustering.

### 9. Documentación: Scalar

**Decisión:** @scalar/express-api-reference para documentación interactiva.

**Alternativas consideradas:**
- Swagger UI: Más conocido pero界面 menos moderna
- Redoc: Similar pero menos integraciones
- Postman: Solo para testing, no auto-hosted

**Razón:** Scalar es moderno, tiene integración directa con Express, soporta OpenAPI 3.1, y el usuario lo especificó.

### 10. Docker Compose: 3 servicios

**Decisión:** docker-compose.yml con servicios api, postgres, seaweedfs.

**Alternativas consideradas:**
- Solo api + postgres: SeaweedFS podría ser externo
- Todos en un container: Violación de un container = un proceso

**Razón:** Separación clara de responsabilidades. SeaweedFS como servicio independiente permite upgrade y escalar separado.

## Risks / Trade-offs

### [Riesgo] Tamaño de seed data (~255 MB en DB)
**Mitigación:** Usar versiones simplificadas de geoBoundaries. Importar solo ADM1+ADM2 initially, ADM3 optional.

### [Riesgo] SeaweedFS single point of failure
**Mitigación:** Para MVP es aceptable. En producción se puede agregar replica o migrar a S3/MinIO cluster.

### [Riesgo] memory store para rate limiting se pierde en restart
**Mitigación:** Aceptable para MVP. Redis store se puede agregar después.

### [Riesgo] Google OAuth dependency
**Mitigación:** Si Google cambia términos, se puede agregar otro provider (GitHub, email/password) sin cambiar specs.

### [Trade-off] WebP vs JPEG
**Pro WebP:** 25-35% más pequeño, soporte 97% browsers
**Contra WebP:** Algunos tools antiguos no lo soportan, procesamiento ligeramente más lento
**Decisión:** WebP es el estándar moderno, la ventaja de tamaño supera la compatibilidad marginal.

### [Trade-off] geoBoundaries vs fuentes oficiales
**Pro geoBoundaries:** Consistencia, una sola API, mantenimiento centralizado
**Contra geoBoundaries:** Datos pueden estar desactualizados vs fuentes oficiales
**Decisión:** Para app de reportes ciudadanos, la consistencia es más importante que precisión milimétrica de límites.

## Migration Plan

### Fase 1: Setup inicial
1. Crear estructura del proyecto
2. Configurar Docker Compose
3. Configurar Knex + migraciones
4. Configurar Passport + Google OAuth

### Fase 2: Core functionality
1. Implementar auth endpoints
2. Implementar CRUD reports
3. Implementar image processing
4. Implementar SeaweedFS integration

### Fase 3: Geodatos
1. Crear script import-geoboundaries.js
2. Importar 21 países
3. Implementar spatial queries

### Fase 4: Admin & polish
1. Implementar admin endpoints
2. Agregar rate limiting
3. Configurar Scalar docs
4. Testing manual

### Rollback
- Si hay error crítico: docker-compose down && git rollback
- Migraciones Knex permiten rollback con `knex migrate:rollback`

## Open Questions

1. ¿Se requiere autenticación para listar reportes? (Asumido: no, público)
2. ¿Los reportes son públicos o privados? (Asumido: públicos)
3. ¿Se necesita moderación de contenido? (Asumido: no en MVP)
