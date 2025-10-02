# API Contract: Admin Dashboard

## Overview
API endpoints for admin users to manage the platform, users, and content.

## Endpoints

### GET /api/admin/users
**Description**: Get list of all registered users with pagination

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Query Parameters**:
- limit: Number of users to return (default: 20, max: 100)
- offset: Number of users to skip (default: 0)
- search: Search term to filter users by email (optional)

**Success Response (200 OK)**:
```
{
  "users": [
    {
      "id": "user_123456789",
      "email": "user@example.com",
      "creditBalance": 95,
      "registrationDate": "2025-09-30T10:00:00Z",
      "lastLogin": "2025-09-30T11:30:00Z",
      "role": "user",
      "isActive": true
    },
    {
      "id": "user_987654321",
      "email": "admin@example.com",
      "creditBalance": 1000,
      "registrationDate": "2025-09-29T09:00:00Z",
      "lastLogin": "2025-09-30T12:00:00Z",
      "role": "admin",
      "isActive": true
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

**Error Responses**:
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)

### GET /api/admin/analytics
**Description**: Get platform usage analytics and statistics

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Success Response (200 OK)**:
```
{
  "totalUsers": 150,
  "activeUsersToday": 45,
  "totalImagesGenerated": 1250,
  "totalCreditsUsed": 2500,
  "modelUsage": {
    "qwen-image-edit": {
      "usageCount": 800,
      "creditsConsumed": 1500,
      "avgProcessingTime": 15.5,  // seconds
      "costPerUse": 3.0          // credits
    },
    "gemini-flash-image": {
      "usageCount": 450,
      "creditsConsumed": 1000,
      "avgProcessingTime": 18.2,  // seconds
      "costPerUse": 2.5          // credits
    }
  },
  "revenue": {
    "total": 12500,  // in cents
    "last30Days": 3200  // in cents
  }
}
```

**Error Responses**:
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)

### GET /api/admin/transactions
**Description**: Get all credit transactions for audit purposes

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Query Parameters**:
- limit: Number of transactions to return (default: 20, max: 100)
- offset: Number of transactions to skip (default: 0)
- startDate: Filter transactions from this date (optional)
- endDate: Filter transactions to this date (optional)

**Success Response (200 OK)**:
```
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
    "total": 1250
  }
}
```

**Error Responses**:
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)

### POST /api/admin/articles
**Description**: Create a new article or example

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request**:
```
{
  "title": "How to Create Stunning Landscapes",
  "content": "# Creating Beautiful Landscapes\n\nHere are some tips for creating beautiful landscape images...",
  "status": "published",  // or "draft"
  "imageUrl": "https://cdn.example.com/images/article-landscape.jpg"  // optional
}
```

**Success Response (201 Created)**:
```
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

**Error Responses**:
- 400: Invalid input (missing fields)
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)

### GET /api/admin/articles
**Description**: Get all articles

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Query Parameters**:
- limit: Number of articles to return (default: 20, max: 100)
- offset: Number of articles to skip (default: 0)
- status: Filter articles by status (optional)

**Success Response (200 OK)**:
```
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
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

**Error Responses**:
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)

### PUT /api/admin/articles/{id}
**Description**: Update an existing article

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request**:
```
{
  "title": "Updated Title",
  "content": "Updated content here...",
  "status": "published"  // or "draft", "archived"
}
```

**Success Response (200 OK)**:
```
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

**Error Responses**:
- 400: Invalid input (invalid status)
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (user is not admin)
- 404: Article not found