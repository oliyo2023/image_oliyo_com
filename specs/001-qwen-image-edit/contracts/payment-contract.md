# API Contract: Payment and Credits

## Overview
API endpoints for credit management and payment processing.

## Endpoints

### GET /api/credits/balance
**Description**: Get the authenticated user's current credit balance

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Success Response (200 OK)**:
```
{
  "balance": 95,
  "lastUpdated": "2025-09-30T10:30:00Z"
}
```

**Error Responses**:
- 401: Unauthorized (invalid/expired token)

### GET /api/credits/transactions
**Description**: Get the authenticated user's credit transaction history

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Success Response (200 OK)**:
```
{
  "transactions": [
    {
      "id": "txn_123456789",
      "transactionType": "spent",
      "amount": -5,
      "date": "2025-09-30T10:15:00Z",
      "description": "Image generation with qwen-image-edit",
      "relatedModelName": "qwen-image-edit"
    },
    {
      "id": "txn_987654321",
      "transactionType": "earned",
      "amount": 100,
      "date": "2025-09-30T10:00:00Z",
      "description": "Registration bonus"
    }
  ]
}
```

**Error Responses**:
- 401: Unauthorized (invalid/expired token)

### POST /api/credits/purchase-intent
**Description**: Create a payment intent for credit purchase

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request**:
```
{
  "credits": 100,           // number of credits to purchase (100, 500, 1000, etc.)
  "paymentMethodId": "pm_card_visa"  // Stripe payment method ID
}
```

**Success Response (200 OK)**:
```
{
  "success": true,
  "message": "Payment intent created",
  "paymentIntentId": "pi_123456789",
  "clientSecret": "pi_123456789_secret_abc123",
  "amount": 999,            // amount in cents
  "credits": 100
}
```

**Error Responses**:
- 400: Invalid input (invalid credit amount)
- 401: Unauthorized (invalid/expired token)

### POST /api/credits/purchase-confirm
**Description**: Confirm a payment and update user's credit balance

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request**:
```
{
  "paymentIntentId": "pi_123456789"
}
```

**Success Response (200 OK)**:
```
{
  "success": true,
  "message": "Payment confirmed and credits added",
  "newBalance": 195,
  "creditsAdded": 100
}
```

**Error Responses**:
- 400: Invalid input (invalid payment intent)
- 401: Unauthorized (invalid/expired token)
- 402: Payment failed