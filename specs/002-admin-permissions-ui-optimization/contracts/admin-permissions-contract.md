# API Contract: Admin Permissions Management

## Overview
This document specifies the API contracts for the admin permissions and role management functionality.

## Endpoints

### 1. Create New Role
- **POST** `/api/admin/roles`
- **Auth**: Bearer token (admin with role management permission)
- **Request Body**:
  ```json
  {
    "name": "string (required)",
    "description": "string (required)",
    "permissionIds": "string[] (required)"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "role": {
      "id": "string",
      "name": "string",
      "description": "string",
      "permissionIds": "string[]",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "createdBy": "string",
      "isActive": "boolean"
    }
  }
  ```
- **Error Response (400, 401, 403)**:
  ```json
  {
    "success": false,
    "message": "string"
  }
  ```

### 2. Get All Roles
- **GET** `/api/admin/roles`
- **Auth**: Bearer token (admin with role viewing permission)
- **Query Parameters**: 
  - `active` (optional, boolean): Filter by active/inactive roles
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "roles": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "permissionIds": "string[]",
        "createdAt": "datetime",
        "updatedAt": "datetime",
        "createdBy": "string",
        "isActive": "boolean"
      }
    ]
  }
  ```

### 3. Update Role Permissions
- **PUT** `/api/admin/roles/{roleId}`
- **Auth**: Bearer token (admin with role management permission)
- **Request Body**:
  ```json
  {
    "name": "string (optional)",
    "description": "string (optional)",
    "permissionIds": "string[] (optional)"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "role": {
      "id": "string",
      "name": "string",
      "description": "string",
      "permissionIds": "string[]",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "createdBy": "string",
      "isActive": "boolean"
    }
  }
  ```

### 4. Assign Role to Admin User
- **POST** `/api/admin/users/{userId}/roles`
- **Auth**: Bearer token (admin with user management permission)
- **Request Body**:
  ```json
  {
    "roleIds": "string[] (required)"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Roles assigned successfully",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "roleIds": "string[]"
    }
  }
  ```

### 5. Get Admin User Permissions
- **GET** `/api/admin/users/{userId}/permissions`
- **Auth**: Bearer token (admin with user permission view permission)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "permissions": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string"
      }
    ]
  }
  ```

### 6. Check Resource Lock Status
- **GET** `/api/admin/resources/{resourceType}/{resourceId}/lock`
- **Auth**: Bearer token (admin with resource access permission)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "isLocked": "boolean",
    "lockedBy": "string (if locked)",
    "lockAcquiredAt": "datetime (if locked)",
    "lockExpiresAt": "datetime (if locked)",
    "userId": "string (current user id)"
  }
  ```

### 7. Attempt Resource Lock
- **POST** `/api/admin/resources/{resourceType}/{resourceId}/lock`
- **Auth**: Bearer token (admin with resource edit permission)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "acquiredLock": "boolean",
    "message": "string"
  }
  ```

### 8. Release Resource Lock
- **DELETE** `/api/admin/resources/{resourceType}/{resourceId}/lock`
- **Auth**: Bearer token (admin who holds the lock or admin with lock override permission)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Resource lock released"
  }
  ```

### 9. Get User Personalization Settings
- **GET** `/api/admin/users/{userId}/personalization`
- **Auth**: Bearer token (admin with personalization view permission)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "personalization": {
      "dashboardLayout": "json",
      "themeSettings": "json", 
      "widgetPreferences": "json",
      "navigationPreferences": "json"
    }
  }
  ```

### 10. Update User Personalization Settings
- **PUT** `/api/admin/users/{userId}/personalization`
- **Auth**: Bearer token (admin with personalization edit permission)
- **Request Body**:
  ```json
  {
    "dashboardLayout": "json (optional)",
    "themeSettings": "json (optional)",
    "widgetPreferences": "json (optional)",
    "navigationPreferences": "json (optional)"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Personalization settings updated"
  }
  ```

## Common Error Codes
- `400`: Bad Request - Invalid request parameters or body
- `401`: Unauthorized - Invalid or expired auth token
- `403`: Forbidden - Insufficient permissions for requested action
- `404`: Not Found - Requested resource does not exist
- `409`: Conflict - Resource is locked by another user
- `500`: Internal Server Error - Unexpected server error

## Authentication
All endpoints require a Bearer token in the Authorization header:
`Authorization: Bearer {jwt_token}`

## Rate Limiting
All endpoints are subject to rate limiting (100 requests per minute per IP).

---
*API contract for Admin Permissions and UI Optimization feature*