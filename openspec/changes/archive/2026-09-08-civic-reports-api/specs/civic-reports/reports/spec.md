## Purpose

Permitir a los ciudadanos reportar problemas de infraestructura urbana subiendo fotos geolocalizadas con descripción breve y etiquetas, facilitando la gestión y seguimiento por parte de autoridades municipales.

## ADDED Requirements

### Requirement: Create civic report
The system SHALL allow authenticated users to create a civic report containing a photo, GPS coordinates, description (max 180 characters), and tag IDs.

#### Scenario: Successful report creation
- **WHEN** authenticated user submits POST /reports with valid photo, lat, lng, description, and tag_ids
- **THEN** system creates report with status "pending", auto-assigns zone based on GPS, stores thumb and original photos, and returns 201 with report data

#### Scenario: Missing required fields
- **WHEN** user submits POST /reports without photo, coordinates, or description
- **THEN** system returns 400 with validation error indicating missing fields

#### Scenario: Description exceeds limit
- **WHEN** user submits description longer than 180 characters
- **THEN** system returns 400 with error "Description must be 180 characters or less"

### Requirement: List reports with filters
The system SHALL support paginated listing of reports with filters for tags, status, country, date range, and geographic radius.

#### Scenario: Paginated listing
- **WHEN** user requests GET /reports?page=1&limit=20
- **THEN** system returns up to 20 reports with pagination metadata (page, limit, total, totalPages)

#### Scenario: Filter by tag
- **WHEN** user requests GET /reports?tag=veredas
- **THEN** system returns only reports containing the "veredas" tag

#### Scenario: Filter by status
- **WHEN** user requests GET /reports?status=pending
- **THEN** system returns only reports with status "pending"

#### Scenario: Filter by country
- **WHEN** user requests GET /reports?country=CL
- **THEN** system returns only reports located in Chilean zones

#### Scenario: Filter by date range
- **WHEN** user requests GET /reports?from=2024-01-01&to=2024-12-31
- **THEN** system returns only reports created within that date range

#### Scenario: Filter by geographic radius
- **WHEN** user requests GET /reports?lat=-33.45&lng=-70.66&radius=1000
- **THEN** system returns only reports within 1000 meters of the specified coordinates

### Requirement: Get single report
The system SHALL return full details of a single report including photo URLs, zone info, and tags.

#### Scenario: Report exists
- **WHEN** user requests GET /reports/:id for an existing report
- **THEN** system returns 200 with report data including photo_url_thumb, photo_url_original, zone name, and tags

#### Scenario: Report not found
- **WHEN** user requests GET /reports/:id for a non-existent report
- **THEN** system returns 404 with error "Report not found"

### Requirement: Update report status
The system SHALL allow admin users to update the status of any report.

#### Scenario: Admin updates status
- **WHEN** admin user requests PATCH /reports/:id/status with valid status value
- **THEN** system updates report status and returns 200 with updated report

#### Scenario: Non-admin attempts status update
- **WHEN** regular user attempts PATCH /reports/:id/status
- **THEN** system returns 403 with error "Admin access required"

#### Scenario: Invalid status value
- **WHEN** admin user provides status not in [pending, reviewing, in_progress, resolved, rejected]
- **THEN** system returns 400 with error "Invalid status value"

### Requirement: Auto-assign zone to report
The system SHALL automatically assign a zone to each report based on GPS coordinates using PostGIS spatial queries.

#### Scenario: GPS within zone boundary
- **WHEN** report location falls within a zone polygon
- **THEN** system assigns that zone_id to the report

#### Scenario: GPS outside all zones
- **WHEN** report location does not fall within any zone polygon
- **THEN** system assigns the nearest zone (adm_level 2) to the report

### Requirement: Delete own report
The system SHALL allow users to delete only their own reports while in "pending" status.

#### Scenario: User deletes own pending report
- **WHEN** user deletes their own report with status "pending"
- **THEN** system removes report and associated photos

#### Scenario: User attempts to delete other user's report
- **WHEN** user attempts to delete another user's report
- **THEN** system returns 403 with error "Cannot delete other users' reports"

#### Scenario: User attempts to delete non-pending report
- **WHEN** user attempts to delete their own report with status other than "pending"
- **THEN** system returns 400 with error "Can only delete pending reports"
