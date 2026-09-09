## Purpose

Proporcionar herramientas de administración para gestionar usuarios, visualizar estadísticas y supervisar reportes del sistema.

## Requirements

### Requirement: View system statistics
The system SHALL provide aggregate statistics about reports, users, and zones.

#### Scenario: Admin requests stats
- **WHEN** admin requests GET /admin/stats
- **THEN** system returns total reports by status, total users, reports per country, and reports per zone

#### Scenario: Stats date range filter
- **WHEN** admin requests GET /admin/stats?from=2024-01-01&to=2024-12-31
- **THEN** system returns statistics filtered to that date range

### Requirement: List all users (superadmin)
The system SHALL allow superadmin users to list all registered users with pagination.

#### Scenario: Superadmin lists users
- **WHEN** superadmin requests GET /admin/users?page=1&limit=20
- **THEN** system returns paginated list of users with id, email, name, role, created_at

#### Scenario: Non-superadmin denied
- **WHEN** non-superadmin requests GET /admin/users
- **THEN** system returns 403 with error "Superadmin access required"

### Requirement: Change user role (superadmin)
The system SHALL allow superadmin users to change the role of any user.

#### Scenario: Superadmin changes role
- **WHEN** superadmin submits PATCH /admin/users/:id with role "admin"
- **THEN** system updates user role and returns 200 with updated user

#### Scenario: Invalid role value
- **WHEN** superadmin provides role not in [user, admin, superadmin]
- **THEN** system returns 400 with error "Invalid role value"

#### Scenario: Cannot change own role
- **WHEN** superadmin attempts to change their own role
- **THEN** system returns 400 with error "Cannot change your own role"

### Requirement: Delete user (superadmin)
The system SHALL allow superadmin users to deactivate (not delete) user accounts.

#### Scenario: Superadmin deactivates user
- **WHEN** superadmin requests DELETE /admin/users/:id
- **THEN** system sets user as inactive and invalidates their tokens

### Requirement: Rate limiting
The system SHALL enforce rate limits on all endpoints to prevent abuse.

#### Scenario: Public endpoint rate limit
- **WHEN** single IP exceeds 60 requests/minute on GET /reports
- **THEN** system returns 429 with error "Too many requests"

#### Scenario: Authenticated endpoint rate limit
- **WHEN** single user exceeds 10 requests/minute on POST /reports
- **THEN** system returns 429 with error "Rate limit exceeded"

#### Scenario: Admin endpoint rate limit
- **WHEN** single user exceeds 30 requests/minute on admin endpoints
- **THEN** system returns 429 with error "Rate limit exceeded"
