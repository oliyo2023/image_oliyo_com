# Data Model: AI Image Generation and Editing Website

## User Entity
- **id**: string (UUID) - unique identifier
- **email**: string - user's email address (unique)
- **passwordHash**: string - hashed password for authentication
- **creditBalance**: number - user's remaining credits (default: 100)
- **registrationDate**: Date - when user registered
- **lastLoginTime**: Date - timestamp of last login
- **socialLoginProvider**: string? - optional provider name (Google, Facebook, etc.)
- **isActive**: boolean - account status

## Credit Transaction Entity
- **id**: string (UUID) - unique identifier
- **userId**: string - references User.id
- **transactionType**: enum ('CREDIT_PURCHASE', 'CREDIT_BONUS', 'IMAGE_GENERATION', 'IMAGE_EDIT')
- **amount**: number - credit change (positive for additions, negative for deductions)
- **date**: Date - timestamp of transaction
- **description**: string - reason for transaction
- **aiModelUsed**: string? - which AI model was used (for image operations)

## Image Entity
- **id**: string (UUID) - unique identifier
- **userId**: string - references User.id
- **originalFilename**: string - original name of uploaded file
- **storagePath**: string - path to stored file
- **creationDate**: Date - when image was created/uploaded
- **associatedPrompt**: string? - text prompt used to generate/edit image
- **fileFormat**: string - image format (png, jpg, etc.)
- **fileSize**: number - size in bytes
- **imageType**: enum ('UPLOADED', 'GENERATED', 'EDITED') - type classification
- **originalImageId**: string? - if edited, references original image

## AI Model Entity
- **id**: string (UUID) - unique identifier
- **name**: string - model name (qwen-image-edit, gemini-flash-image)
- **usageCount**: number - number of times model was used
- **lastAccessTime**: Date - when model was last used
- **costPerUse**: number - credit cost for using this model
- **isActive**: boolean - whether model is currently available

## Article Entity
- **id**: string (UUID) - unique identifier
- **title**: string - article title
- **content**: string - article content (HTML or markdown)
- **authorId**: string - references admin user ID
- **publicationDate**: Date - when article was published
- **status**: enum ('DRAFT', 'PUBLISHED', 'ARCHIVED')
- **lastModified**: Date - when article was last updated

## Session Entity
- **id**: string (UUID) - unique identifier (session token)
- **userId**: string - references User.id
- **expirationTime**: Date - when session expires
- **createdAt**: Date - when session was created
- **isActive**: boolean - session validity status

## Relationships
- User → CreditTransaction (1 to many)
- User → Image (1 to many)
- User → Session (1 to many)
- User → Article (1 to many - for admins)
- Image → Image (1 to many - original to edited)
- AI Model → Image (1 to many - via image generation/editing)
- Credit Transaction → AI Model (many to 1 - via aiModelUsed)

## Validation Rules
- User.email must be valid email format
- User.creditBalance must be >= 0
- CreditTransaction.amount must be non-zero
- Image.fileSize must be <= 52428800 bytes (50MB)
- Image.fileFormat must be a common image format (jpg, png, gif, webp)
- AI Model.costPerUse must be > 0
- Session expirationTime must be in the future

## State Transitions
- User: INACTIVE → ACTIVE (on initial registration with 100 credits)
- CreditTransaction: PENDING → COMPLETED/FAILED (on transaction completion)
- Session: ACTIVE → INACTIVE (on expiration or logout)
- Article: DRAFT → PUBLISHED/ARCHIVED (on status change)