# API Contract: User Authentication

## Overview
API endpoints for user authentication, registration, and session management.

## Endpoints

### POST /api/auth/register
**Description**: Register a new user account

**Request**:
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Success Response (201 Created)**:
```
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_123456789",
    "email": "user@example.com",
    "creditBalance": 100,
    "registrationDate": "2025-09-30T10:00:00Z"
  },
  "token": "jwt_token_here"
}
```

**Error Responses**:
- 400: Invalid input (email format, password requirements, etc.)
- 409: Email already exists

### POST /api/auth/login
**Description**: Authenticate user and create session

**Request**:
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200 OK)**:
```
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_123456789",
    "email": "user@example.com",
    "creditBalance": 100
  },
  "token": "jwt_token_here"
}
```

**Error Responses**:
- 400: Invalid input
- 401: Invalid credentials

### POST /api/auth/login/social
**Description**: Authenticate user via social provider

**Request**:
```
POST /api/auth/login/social
Content-Type: application/json

{
  "provider": "google",  // or "facebook"
  "socialToken": "oauth_token_from_provider"
}
```

**Success Response (200 OK)**:
```
{
  "success": true,
  "message": "Social login successful",
  "user": {
    "id": "user_123456789",
    "email": "user@example.com",
    "creditBalance": 100,
    "socialLoginProvider": "google"
  },
  "token": "jwt_token_here"
}
```

### GET /api/auth/profile
**Description**: Get authenticated user profile

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Success Response (200 OK)**:
```
{
  "id": "user_123456789",
  "email": "user@example.com",
  "creditBalance": 100,
  "registrationDate": "2025-09-30T10:00:00Z",
  "lastLogin": "2025-09-30T11:30:00Z"
}
```

**Error Responses**:
- 401: Unauthorized (invalid/expired token)

### POST /api/auth/logout
**Description**: Logout user and invalidate session

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Success Response (200 OK)**:
```
{
  "success": true,
  "message": "Logged out successfully"
}
```