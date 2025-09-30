# API Contract: Image Generation and Editing

## Overview
API endpoints for image generation from text prompts and image editing capabilities.

## Endpoints

### POST /api/images/generate
**Description**: Generate a new image from a text prompt using an AI model

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Request**:
```
POST /api/images/generate
Content-Type: application/json

{
  "prompt": "A beautiful landscape with mountains and a lake",
  "model": "qwen-image-edit",  // or "gemini-flash-image"
  "width": 1024,               // optional, default: 512
  "height": 1024,              // optional, default: 512
  "style": "realistic"         // optional, default: "realistic"
}
```

**Success Response (200 OK)**:
```
{
  "success": true,
  "message": "Image generation initiated",
  "imageId": "img_123456789",
  "status": "processing",      // or "completed"
  "estimatedCompletion": "2025-09-30T10:05:00Z"  // if processing
}
```

When completed, subsequent requests to GET /api/images/{id} will return the generated image.

**Error Responses**:
- 400: Invalid input (empty prompt, invalid model name, etc.)
- 401: Unauthorized (invalid/expired token)
- 402: Insufficient credits
- 429: Rate limit exceeded

### POST /api/images/edit
**Description**: Edit an existing image using a text prompt

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Request**:
```
POST /api/images/edit
- prompt: "Make the sky more blue and add clouds"
- model: "qwen-image-edit"  // or "gemini-flash-image"
- image: <uploaded_image_file>  // image must be < 50MB
- strength: 0.7  // optional, how much to change the image (0.0-1.0, default: 0.5)
```

**Success Response (200 OK)**:
```
{
  "success": true,
  "message": "Image editing initiated",
  "imageId": "img_987654321",
  "status": "processing",      // or "completed"
  "estimatedCompletion": "2025-09-30T10:05:00Z"  // if processing
}
```

**Error Responses**:
- 400: Invalid input (empty prompt, invalid model, unsupported file type, oversized file)
- 401: Unauthorized (invalid/expired token)
- 402: Insufficient credits
- 413: File too large (>50MB)
- 429: Rate limit exceeded

### GET /api/images
**Description**: Get list of user's generated and edited images

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Success Response (200 OK)**:
```
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
    },
    {
      "id": "img_987654321",
      "originalFilename": "edited-photo.jpg",
      "storagePath": "https://cdn.example.com/images/user123/987654321.jpg",
      "creationDate": "2025-09-30T11:00:00Z",
      "prompt": "Make the sky more blue and add clouds",
      "modelName": "gemini-flash-image",
      "originalImageId": "img_original123",
      "status": "completed"
    }
  ]
}
```

**Error Responses**:
- 401: Unauthorized (invalid/expired token)

### GET /api/images/{id}
**Description**: Get details of a specific image

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Success Response (200 OK)**:
```
{
  "id": "img_123456789",
  "originalFilename": "generated-landscape.png",
  "storagePath": "https://cdn.example.com/images/user123/123456789.png",
  "creationDate": "2025-09-30T10:00:00Z",
  "prompt": "A beautiful landscape with mountains and a lake",
  "modelName": "qwen-image-edit",
  "status": "completed",
  "userId": "user_123456789"
}
```

**Error Responses**:
- 401: Unauthorized (invalid/expired token)
- 404: Image not found