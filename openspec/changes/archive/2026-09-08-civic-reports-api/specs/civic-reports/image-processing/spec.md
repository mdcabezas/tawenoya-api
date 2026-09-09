## Purpose

Procesar imágenes subidas por usuarios generando dos versiones optimizadas (thumb y original) en formato WebP para equilibrar calidad y rendimiento en diferentes contextos de visualización.

## ADDED Requirements

### Requirement: Generate thumbnail version
The system SHALL generate a thumbnail version of each uploaded image at 800px maximum width/height with 80% quality in WebP format.

#### Scenario: Thumbnail generation
- **WHEN** user uploads a JPEG or PNG image
- **THEN** system generates WebP thumbnail (max 800px, quality 80%) approximately 50-100 KB

#### Scenario: Image smaller than thumb dimensions
- **WHEN** user uploads image smaller than 800px
- **THEN** system preserves original dimensions without upscaling

### Requirement: Generate original version
The system SHALL generate an original version of each uploaded image at 2048px maximum width/height with 90% quality in WebP format.

#### Scenario: Original generation
- **WHEN** user uploads a JPEG or PNG image
- **THEN** system generates WebP original (max 2048px, quality 90%) approximately 300-600 KB

### Requirement: Support common image formats
The system SHALL accept JPEG, PNG, and WebP as input formats.

#### Scenario: JPEG upload
- **WHEN** user uploads JPEG image
- **THEN** system processes and generates WebP versions successfully

#### Scenario: PNG upload
- **WHEN** user uploads PNG image
- **THEN** system processes and generates WebP versions successfully

#### Scenario: WebP upload
- **WHEN** user uploads WebP image
- **THEN** system processes and generates WebP versions successfully

### Requirement: Reject invalid formats
The system SHALL reject non-image files and unsupported image formats.

#### Scenario: Non-image file upload
- **WHEN** user uploads PDF, GIF, or other non-supported file
- **THEN** system returns 400 with error "Unsupported image format. Allowed: JPEG, PNG, WebP"

### Requirement: Auto-orient images
The system SHALL auto-orient images based on EXIF orientation metadata before processing.

#### Scenario: Rotated EXIF image
- **WHEN** user uploads image with EXIF orientation tag
- **THEN** system corrects orientation before generating versions

### Requirement: Maintain aspect ratio
The system SHALL maintain original aspect ratio when resizing images.

#### Scenario: Landscape image
- **WHEN** user uploads 1920x1080 image
- **THEN** system generates thumb 800x450 and original 2048x1152

#### Scenario: Portrait image
- **WHEN** user uploads 1080x1920 image
- **THEN** system generates thumb 450x800 and original 1152x2048

#### Scenario: Square image
- **WHEN** user uploads 1000x1000 image
- **THEN** system generates thumb 800x800 and original 2048x2048
