## Purpose

Autenticar usuarios mediante Google OAuth2 y gestionar sesiones con JWT, asignando roles (user/admin/superadmin) para controlar acceso a endpoints protegidos.

## ADDED Requirements

### Requirement: Google OAuth2 login
The system SHALL authenticate users via Google OAuth2, creating new users on first login or returning existing users.

#### Scenario: First-time login
- **WHEN** user completes Google OAuth flow for the first time
- **THEN** system creates user record with google_id, email, name, avatar_url, role "user", and returns JWT token

#### Scenario: Returning user login
- **WHEN** user completes Google OAuth flow with existing google_id
- **THEN** system returns JWT token with user data

#### Scenario: OAuth callback failure
- **WHEN** Google returns error or denied consent
- **THEN** system redirects to client with error parameter

### Requirement: JWT token issuance
The system SHALL issue JWT tokens containing user id, email, role, and expiration (24 hours).

#### Scenario: Token generation
- **WHEN** user successfully authenticates
- **THEN** system returns access token with 24-hour expiration

#### Scenario: Token contains role
- **WHEN** JWT token is generated
- **THEN** token payload includes user role (user/admin/superadmin)

### Requirement: Protected endpoint authentication
The system SHALL validate JWT tokens on protected endpoints and reject invalid/expired tokens.

#### Scenario: Valid token
- **WHEN** user sends request with valid Authorization: Bearer <token> header
- **THEN** system processes request with authenticated user context

#### Scenario: Missing token
- **WHEN** user accesses protected endpoint without Authorization header
- **THEN** system returns 401 with error "Authentication required"

#### Scenario: Expired token
- **WHEN** user sends request with expired JWT token
- **THEN** system returns 401 with error "Token expired"

#### Scenario: Invalid token
- **WHEN** user sends request with malformed or invalid JWT token
- **THEN** system returns 401 with error "Invalid token"

### Requirement: Get current user
The system SHALL return authenticated user's profile data.

#### Scenario: Authenticated user requests profile
- **WHEN** authenticated user requests GET /auth/me
- **THEN** system returns 200 with user id, email, name, avatar_url, role, created_at

### Requirement: Role-based access control
The system SHALL enforce role-based access: user < admin < superadmin.

#### Scenario: Admin access
- **WHEN** user with role "admin" accesses admin endpoint
- **THEN** system grants access

#### Scenario: Regular user denied admin endpoint
- **WHEN** user with role "user" accesses admin endpoint
- **THEN** system returns 403 with error "Admin access required"

#### Scenario: Superadmin access
- **WHEN** user with role "superadmin" accesses superadmin endpoint
- **THEN** system grants access

#### Scenario: Admin denied superadmin endpoint
- **WHEN** user with role "admin" accesses superadmin endpoint
- **THEN** system returns 403 with error "Superadmin access required"
