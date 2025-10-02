# API Documentation: AI Image Generation and Editing Website

## Overview

This document describes the API endpoints for the AI Image Generation and Editing Website. All API requests should be made to the `/api` endpoint and follow RESTful conventions.

## Authentication

Most API endpoints require authentication via a session token. The session token should be included in the request body or in the Authorization header:

```
Authorization: Bearer <session-token>
```

Or in the request body:
```json
{
  "sessionToken": "<session-token>"
}
```

## Common Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },  // Optional: payload data
  "message": "Human-readable message",  // Optional: informational message
  "error": "Error message"  // Present only when success is false
}
```

## Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "userId": "uuid-string",
  "email": "user@example.com",
  "creditBalance": 100,
  "message": "Account created successfully with 100 free credits"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid input or email already exists"
}
```

#### POST /api/auth/login

Authenticate a user and return a session token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "sessionToken": "jwt-token-string",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "creditBalance": 95
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

#### POST /api/auth/logout

Logout a user and invalidate their session.

**Request Body:**
```json
{
  "sessionToken": "jwt-token-string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### Image Operation Endpoints

#### POST /api/images/generate

Generate a new image from a text prompt using AI models.

**Request Body:**
```json
{
  "prompt": "A beautiful landscape with mountains and lakes",
  "aiModel": "qwen-image-edit",
  "sessionToken": "jwt-token-string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "imageId": "uuid-string",
  "imageUrl": "/api/images/download/[id]",
  "creditsUsed": 5,
  "finalCreditBalance": 90,
  "message": "Image generated successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid request parameters"
}
```

**Response (402 Payment Required):**
```json
{
  "success": false,
  "error": "Insufficient credits",
  "requiredCredits": 5,
  "currentCredits": 2
}
```

#### POST /api/images/edit

Edit an existing image using a text prompt and AI models.

**Request Body:**
```json
{
  "imageId": "uuid-of-existing-image",
  "prompt": "Add snow to the mountains in this image",
  "aiModel": "gemini-flash-image",
  "sessionToken": "jwt-token-string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "imageId": "uuid-string-for-edited-image",
  "imageUrl": "/api/images/download/[id]",
  "creditsUsed": 10,
  "finalCreditBalance": 85,
  "originalImageId": "uuid-of-existing-image",
  "message": "Image edited successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid request parameters"
}
```

#### POST /api/images/upload

Upload an image for later editing.

**Request Body (multipart/form-data):**
```
file: [image file up to 50MB]
sessionToken: "jwt-token-string"
```

**Response (200 OK):**
```json
{
  "success": true,
  "imageId": "uuid-string",
  "filename": "original-filename.jpg",
  "message": "Image uploaded successfully"
}
```

**Response (413 Payload Too Large):**
```json
{
  "success": false,
  "error": "File too large, maximum 50MB allowed"
}
```

### Credit Management Endpoints

#### GET /api/credits/balance

Get the current credit balance for the authenticated user.

**Request Headers:**
```
Authorization: Bearer <session-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "balance": 95
}
```

#### GET /api/credits/history

Get the credit transaction history for the authenticated user.

**Request Headers:**
```
Authorization: Bearer <session-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "transaction-id",
      "transactionType": "IMAGE_GENERATION",
      "amount": -5,
      "date": "2023-01-01T00:00:00.000Z",
      "description": "Image generation using qwen-image-edit",
      "aiModelUsed": "qwen-image-edit"
    }
  ]
}
```

## Error Codes

- `200 OK`: Request successful
- `201 Created`: Resource successfully created
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing session token
- `402 Payment Required`: Insufficient credits for the operation
- `404 Not Found`: Requested resource not found
- `413 Payload Too Large`: Uploaded file exceeds size limit
- `500 Internal Server Error`: Unexpected server error

## Rate Limiting

API endpoints are subject to rate limiting. Exceeding the rate limit will result in a `429 Too Many Requests` response.

## Image Constraints

- Maximum file size: 50MB
- Supported formats: JPG, JPEG, PNG, GIF, WebP
- Maximum dimensions: 4000x4000 pixels