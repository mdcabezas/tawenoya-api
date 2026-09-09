## Purpose

Almacenar imágenes de reportes en SeaweedFS (compatible S3) con acceso público para lectura, organizando archivos por report ID para facilitar gestión y limpieza.

## Requirements

### Requirement: Upload images to SeaweedFS
The system SHALL upload processed images to SeaweedFS with public read access.

#### Scenario: Successful upload
- **WHEN** image processing completes
- **THEN** system uploads thumb.webp and original.webp to SeaweedFS under reports/{uuid}/

#### Scenario: Upload failure
- **WHEN** SeaweedFS is unreachable
- **THEN** system returns 500 with error "Storage service unavailable"

### Requirement: Public read access
The system SHALL serve stored images via public URLs without authentication.

#### Scenario: Access thumb image
- **WHEN** client requests http://seaweedfs:8333/reports/{uuid}/thumb.webp
- **THEN** SeaweedFS returns the image with 200 status

#### Scenario: Access original image
- **WHEN** client requests http://seaweedfs:8333/reports/{uuid}/original.webp
- **THEN** SeaweedFS returns the image with 200 status

### Requirement: Organized file structure
The system SHALL store images in a hierarchical structure: reports/{report_uuid}/thumb.webp and reports/{report_uuid}/original.webp.

#### Scenario: File path convention
- **WHEN** report has UUID "abc-123"
- **THEN** files are stored at reports/abc-123/thumb.webp and reports/abc-123/original.webp

### Requirement: Delete images on report deletion
The system SHALL delete associated images when a report is permanently deleted.

#### Scenario: Report deletion cleanup
- **WHEN** report is deleted
- **THEN** system removes reports/{uuid}/ from SeaweedFS

### Requirement: Generate presigned URLs
The system SHALL generate presigned URLs for temporary secure access when needed.

#### Scenario: Presigned URL generation
- **WHEN** system needs time-limited access to a photo
- **THEN** system generates presigned URL valid for 1 hour
