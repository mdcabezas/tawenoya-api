## Purpose

Gestionar geocercas de 21 países usando geoBoundaries como fuente de datos unificada, permitiendo consulta espacial PostGIS para auto-asignar zonas a reportes según coordenadas GPS.

## Requirements

### Requirement: Query zones by country
The system SHALL support querying zones filtered by country code and administration level.

#### Scenario: List zones by country
- **WHEN** user requests GET /zones?country=CL&adm_level=2
- **THEN** system returns all Chilean zones at administration level 2 (provincias)

#### Scenario: List all levels for country
- **WHEN** user requests GET /zones?country=CL
- **THEN** system returns all Chilean zones across all levels

#### Scenario: Search zones by name
- **WHEN** user requests GET /zones?search=santiago
- **THEN** system returns zones matching "santiago" (case-insensitive)

### Requirement: Get zone details
The system SHALL return zone details including parent zone and child zones.

#### Scenario: Zone with parent and children
- **WHEN** user requests GET /zones/:id
- **THEN** system returns zone data with parent_id, name, adm_level, country, and list of child zone IDs

#### Scenario: Zone not found
- **WHEN** user requests GET /zones/:id for non-existent zone
- **THEN** system returns 404 with error "Zone not found"

### Requirement: Get reports in zone
The system SHALL return all reports located within a specific zone.

#### Scenario: List reports in zone
- **WHEN** user requests GET /zones/:id/reports
- **THEN** system returns paginated list of reports where zone_id matches

#### Scenario: Zone with no reports
- **WHEN** user requests reports for a zone with no reports
- **THEN** system returns empty array with total: 0

### Requirement: Create zone (superadmin only)
The system SHALL allow superadmin users to manually create new zones with GeoJSON polygon boundaries.

#### Scenario: Superadmin creates zone
- **WHEN** superadmin user submits POST /zones with valid GeoJSON polygon and parent_id
- **THEN** system creates zone and returns 201 with zone data

#### Scenario: Non-superadmin attempts create
- **WHEN** non-superadmin user attempts POST /zones
- **THEN** system returns 403 with error "Superadmin access required"

### Requirement: Spatial zone assignment
The system SHALL use PostGIS ST_Contains to determine which zone contains a given GPS point.

#### Scenario: Point inside zone
- **WHEN** system evaluates point (-70.66, -33.45) against Chilean zones
- **THEN** system returns the zone whose polygon contains that point

#### Scenario: Point outside all zones
- **WHEN** system evaluates point in international waters
- **THEN** system returns null (no zone assigned)

#### Scenario: Fallback to nearest zone
- **WHEN** exact zone match fails for a report's GPS coordinates
- **THEN** system assigns the geographically nearest zone at adm_level 2

### Requirement: Import zones from geoBoundaries
The system SHALL support bulk import of zone data from geoBoundaries API for supported countries.

#### Scenario: Import single country
- **WHEN** system runs import script for country code "CHL"
- **THEN** system downloads ADM1 and ADM2 polygons and inserts into zones table

#### Scenario: Import all supported countries
- **WHEN** system runs full import script
- **THEN** system imports zones for all 21 supported countries (~13,000 zones total)
