// docs/api.md
# API Documentation: AI Image Generation and Editing Platform

## Overview
This document provides detailed documentation for all API endpoints in the AI Image Generation and Editing Platform.

## Authentication
All authenticated endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
`https://your-domain.com/api`

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Success Response (201):**
```json
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

**Error Response:**
- 400: Invalid input (email format, password requirements, etc.)
- 409: Email already exists

#### POST /api/auth/login
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
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

**Error Response:**
- 400: Invalid input
- 401: Invalid credentials

#### POST /api/auth/login-social
Authenticate user via social provider.

**Request Body:**
```json
{
  "provider": "google", // or "facebook"
  "socialToken": "oauth_token_from_provider"
}
```

**Success Response (200):**
```json
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

#### GET /api/auth/profile
Get authenticated user profile.

**Success Response (200):**
```json
{
  "id": "user_123456789",
  "email": "user@example.com",
  "creditBalance": 100,
  "registrationDate": "2025-09-30T10:00:00Z",
  "lastLogin": "2025-09-30T11:30:00Z"
}
```

**Error Response:**
- 401: Unauthorized (invalid/expired token)

#### POST /api/auth/logout
Logout user and invalidate session.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Image Operations

#### POST /api/images/generate
Generate a new image from a text prompt using an AI model.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "prompt": "A beautiful landscape with mountains and a lake",
  "model": "qwen-image-edit", // or "gemini-flash-image"
  "width": 1024, // optional, default: 512
  "height": 1024, // optional, default: 512
  "style": "realistic" // optional, default: "realistic"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image generation initiated",
  "imageId": "img_123456789",
  "status": "processing", // or "completed"
  "estimatedCompletion": "2025-09-30T10:05:00Z" // if processing
}
```

**Error Responses:**
- 400: Invalid input (empty prompt, invalid model name, etc.)
- 401: Unauthorized (invalid/expired token)
- 402: Insufficient credits
- 429: Rate limit exceeded

#### POST /api/images/edit
Edit an existing image using a text prompt.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "prompt": "Make the sky more blue and add clouds",
  "model": "qwen-image-edit", // or "gemini-flash-image"
  "originalImageId": "img_original123",
  "strength": 0.7 // optional, how much to change the image (0.0-1.0, default: 0.5)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image editing initiated",
  "imageId": "img_987654321",
  "status": "processing", // or "completed"
  "estimatedCompletion": "2025-09-30T10:05:00Z" // if processing
}
```

**Error Responses:**
- 400: Invalid input (empty prompt, invalid model, etc.)
- 401: Unauthorized (invalid/expired token)
- 402: Insufficient credits
- 429: Rate limit exceeded

#### GET /api/images
Get list of user's generated and edited images.

**Query Parameters (optional):**
- limit (default: 20)
- offset (default: 0)

**Success Response (200):**
```json
{
  "images": [
    {
      "id": "img_123456789",
      "originalFilename": "generated-landscape.png",
      "storagePath": "https://cdn.example.com/images/user123/123456789.png",
      "creationDate": "2025-09-30T10:00:00Z",
      "prompt": "A beautiful landscape with mountains and a lake",
      "modelName": "qwen-image-edit",
      "status": "completed"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0,
    "hasNext": false
  }
}
```

**Error Response:**
- 401: Unauthorized (invalid/expired token)

### Credit Management

#### GET /api/credits/balance
Get the authenticated user's current credit balance.

**Success Response (200):**
```json
{
  "balance": 95,
  "lastUpdated": "2025-09-30T10:30:00Z"
}
```

**Error Response:**
- 401: Unauthorized (invalid/expired token)

#### GET /api/credits/transactions
Get the authenticated user's credit transaction history.

**Query Parameters (optional):**
- limit (default: 20)
- offset (default: 0)

**Success Response (200):**
```json
{
  "transactions": [
    {
      "id": "txn_123456789",
      "transactionType": "spent",
      "amount": -5,
      "date": "2025-09-30T10:15:00Z",
      "description": "Image generation with qwen-image-edit",
      "relatedModelName": "qwen-image-edit"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 15
  }
}
```

**Error Response:**
- 401: Unauthorized (invalid/expired token)

#### POST /api/credits/purchase-intent
Create a payment intent for credit purchase.

**Request Body:**
```json
{
  "credits": 100, // number of credits to purchase (100, 500, 1000)
  "paymentMethodId": "pm_card_visa" // Stripe payment method ID
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment intent created",
  "paymentIntentId": "pi_123456789",
  "clientSecret": "pi_123456789_secret_abc123",
  "amount": 999, // amount in cents
  "credits": 100
}
```

**Error Response:**
- 400: Invalid input (invalid credit amount)
- 401: Unauthorized (invalid/expired token)

#### POST /api/credits/purchase-confirm
Confirm a payment and update user's credit balance.

**Request Body:**
```json
{
  "paymentIntentId": "pi_123456789"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment confirmed and credits added",
  "newBalance": 195,
  "creditsAdded": 100
}
```

**Error Response:**
- 400: Invalid input (invalid payment intent)
- 401: Unauthorized (invalid/expired token)
- 402: Payment failed

### Admin Endpoints

#### GET /api/admin/users
Get list of all users with basic information.

**Query Parameters (optional):**
- limit (default: 50)
- offset (default: 0)

**Success Response (200):**
```json
{
  "users": [
    {
      "id": "user_123456789",
      "email": "user1@example.com",
      "creditBalance": 75,
      "registrationDate": "2025-09-30T10:00:00Z",
      "lastLogin": "2025-09-30T11:30:00Z",
      "role": "user"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasNext": true
  }
}
```

**Error Response:**
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)

#### GET /api/admin/analytics
Get platform usage analytics.

**Success Response (200):**
```json
{
  "totalUsers": 150,
  "activeUsersToday": 45,
  "totalImagesGenerated": 1250,
  "totalCreditsUsed": 2500,
  "modelUsage": {
    "qwen-image-edit": {
      "usageCount": 800,
      "creditsConsumed": 1500,
      "avgProcessingTime": 15.5 // seconds
    },
    "gemini-flash-image": {
      "usageCount": 450,
      "creditsConsumed": 1000,
      "avgProcessingTime": 18.2 // seconds
    }
  },
  "revenue": {
    "total": 12500, // in cents
    "last30Days": 3200 // in cents
  }
}
```

**Error Response:**
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)

#### GET /api/admin/transactions
Get all credit transactions for audit purposes.

**Query Parameters (optional):**
- limit (default: 50)
- offset (default: 0)
- userId (filter by user ID)
- type (filter by transaction type: earned/spent/purchased)

**Success Response (200):**
```json
{
  "transactions": [
    {
      "id": "txn_123456789",
      "userId": "user_123456789",
      "userEmail": "user1@example.com",
      "transactionType": "spent",
      "amount": -5,
      "date": "2025-09-30T10:15:00Z",
      "description": "Image generation with qwen-image-edit",
      "relatedModelName": "qwen-image-edit"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "totalPages": 25
  }
}
```

**Error Response:**
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)

#### POST /api/admin/articles
Create a new article or example.

**Request Body:**
```json
{
  "title": "How to Create Stunning Landscapes",
  "content": "# Creating Beautiful Landscapes\n\nHere are some tips for creating beautiful landscape images...",
  "status": "published", // or "draft", "archived"
  "imageUrl": "https://cdn.example.com/images/article-image.jpg" // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Article created successfully",
  "article": {
    "id": "article_123456789",
    "title": "How to Create Stunning Landscapes",
    "authorId": "user_987654321",
    "publicationDate": "2025-09-30T12:00:00Z",
    "status": "published"
  }
}
```

**Error Response:**
- 400: Invalid input (missing fields)
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)

#### GET /api/admin/articles
Get all articles.

**Query Parameters (optional):**
- limit (default: 20)
- offset (default: 0)
- status (filter by status: draft/published/archived)

**Success Response (200):**
```json
{
  "articles": [
    {
      "id": "article_123456789",
      "title": "How to Create Stunning Landscapes",
      "authorId": "user_987654321",
      "authorEmail": "admin@example.com",
      "publicationDate": "2025-09-30T12:00:00Z",
      "status": "published"
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 20,
    "offset": 0,
    "hasNext": false
  }
}
```

**Error Response:**
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)

#### PUT /api/admin/articles/[id]
Update an existing article.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content here...",
  "status": "published" // or "draft", "archived"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Article updated successfully",
  "article": {
    "id": "article_123456789",
    "title": "Updated Title",
    "authorId": "user_987654321",
    "publicationDate": "2025-09-30T12:00:00Z",
    "status": "published"
  }
}
```

**Error Response:**
- 400: Invalid input (invalid status)
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)
- 404: Article not found