## Purpose

Gestionar etiquetas predefinidas para categorizar reportes, administradas exclusivamente por superadmin para mantener consistencia en la clasificación.

## ADDED Requirements

### Requirement: List active tags
The system SHALL return all active tags available for report categorization.

#### Scenario: Public tag listing
- **WHEN** any user requests GET /tags
- **THEN** system returns array of active tags with id, name, and icon

#### Scenario: Include inactive tags for admin
- **WHEN** superadmin requests GET /tags?include_inactive=true
- **THEN** system returns all tags including inactive ones

### Requirement: Create tag (superadmin only)
The system SHALL allow superadmin users to create new tags with name and icon.

#### Scenario: Superadmin creates tag
- **WHEN** superadmin submits POST /tags with unique name and icon
- **THEN** system creates tag with is_active=true and returns 201

#### Scenario: Duplicate tag name
- **WHEN** superadmin submits POST /tags with existing tag name
- **THEN** system returns 409 with error "Tag name already exists"

#### Scenario: Non-superadmin attempts create
- **WHEN** non-superadmin user attempts POST /tags
- **THEN** system returns 403 with error "Superadmin access required"

### Requirement: Update tag (superadmin only)
The system SHALL allow superadmin users to update tag name, icon, or active status.

#### Scenario: Superadmin updates tag
- **WHEN** superadmin submits PUT /tags/:id with valid changes
- **THEN** system updates tag and returns 200 with updated data

#### Scenario: Deactivate tag
- **WHEN** superadmin sets is_active=false on a tag
- **THEN** tag is excluded from public listing but existing reports retain the tag

### Requirement: Delete tag (superadmin only)
The system SHALL allow superadmin users to delete tags not currently used in any report.

#### Scenario: Delete unused tag
- **WHEN** superadmin deletes tag with no associated reports
- **THEN** system removes tag permanently

#### Scenario: Delete tag in use
- **WHEN** superadmin attempts to delete tag associated with reports
- **THEN** system returns 409 with error "Cannot delete tag in use by reports"

### Requirement: Assign tags to report
The system SHALL allow multiple tags to be assigned to a single report.

#### Scenario: Create report with tags
- **WHEN** user creates report with tag_ids ["uuid1", "uuid2"]
- **THEN** system creates report_tag associations for both tags

#### Scenario: Invalid tag ID
- **WHEN** user provides non-existent tag_id
- **THEN** system returns 400 with error "Invalid tag ID: {id}"
