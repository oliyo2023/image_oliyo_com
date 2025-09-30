# Data Model: AI Image Generation and Editing Website

## Overview
This document defines the data models for the AI Image Generation and Editing Website, including entities, relationships, and validation rules based on the feature specification.

## Entity: User
**Description**: Represents a registered user account

**Fields**:
- `id` (String, Primary Key): Unique identifier for the user
- `email` (String): User's email address, must be unique and valid
- `passwordHash` (String): Hashed password using bcrypt or similar
- `creditBalance` (Int): Number of credits available to the user (default: 100)
- `registrationDate` (DateTime): Date and time the account was created
- `lastLogin` (DateTime): Date and time of last login
- `socialLoginProvider` (String, optional): Provider name if using social login (e.g., Google, Facebook)
- `isActive` (Boolean): Whether the account is active (default: true)
- `role` (String): User role (default: "user", "admin" for admin users)

**Validation Rules**:
- Email must be a valid email format
- Password must meet security requirements (min 8 chars, 1 upper, 1 lower, 1 number)
- Credit balance cannot be negative
- Email must be unique

## Entity: CreditTransaction
**Description**: Represents a credit operation (earning, spending, purchasing)

**Fields**:
- `id` (String, Primary Key): Unique identifier for the transaction
- `userId` (String, Foreign Key): Reference to the user who made the transaction
- `transactionType` (String): Type of transaction ("earned", "spent", "purchased")
- `amount` (Int): Number of credits affected (positive for earned/purchased, negative for spent)
- `date` (DateTime): Date and time of transaction
- `description` (String): Details about the transaction
- `relatedModelName` (String, optional): AI model used for spent transactions

**Validation Rules**:
- Transaction type must be one of the allowed values
- Amount must be non-zero
- References to valid user

**Relationships**:
- Many CreditTransactions belong to one User (userId → User.id)

## Entity: Image
**Description**: Represents an image created by the system or uploaded by a user

**Fields**:
- `id` (String, Primary Key): Unique identifier for the image
- `userId` (String, Foreign Key): Reference to the user who owns this image
- `originalFilename` (String): Original name of the uploaded file
- `storagePath` (String): Path to the image in storage system (S3/bucket)
- `creationDate` (DateTime): Date and time the image record was created
- `prompt` (String): Text prompt used to generate the image (if applicable)
- `fileFormat` (String): Format of the image file (jpeg, png, etc.)
- `fileSize` (Int): Size of the image file in bytes
- `originalImageId` (String, optional): Reference to the original image if this is an edited version
- `modelName` (String): AI model used to generate or edit the image
- `status` (String): Processing status ("pending", "processing", "completed", "failed")

**Validation Rules**:
- File format must be one of the supported formats
- File size must not exceed 50MB
- References to valid user
- Status must be one of the allowed values

**Relationships**:
- Many Images belong to one User (userId → User.id)
- One Image can be based on another Image (originalImageId → Image.id)

## Entity: AIModel
**Description**: Represents an AI model used for image generation/editing

**Fields**:
- `id` (String, Primary Key): Unique identifier for the AI model
- `name` (String): Name of the AI model (e.g., "qwen-image-edit", "gemini-flash-image")
- `costPerUse` (Float): Cost in credits for using this model once
- `isActive` (Boolean): Whether the model is currently available for use
- `lastAccessTime` (DateTime): Date and time of last usage
- `usageCount` (Int): Number of times this model has been used

**Validation Rules**:
- Name must be unique
- Cost must be non-negative
- Name must be one of the supported models

## Entity: Article
**Description**: Represents content created by admin users

**Fields**:
- `id` (String, Primary Key): Unique identifier for the article
- `title` (String): Title of the article
- `content` (String): Main content of the article (HTML or markdown)
- `authorId` (String, Foreign Key): Reference to the admin user who created the article
- `publicationDate` (DateTime): Date and time the article was published
- `status` (String): Publication status ("draft", "published", "archived")
- `imageUrl` (String, optional): URL to a featured image for the article

**Validation Rules**:
- Title and content must not be empty
- Author must be an admin user
- Status must be one of the allowed values

**Relationships**:
- Many Articles belong to one User (authorId → User.id)

## Entity: Session
**Description**: Represents a user authentication session

**Fields**:
- `id` (String, Primary Key): Unique identifier for the session
- `userId` (String, Foreign Key): Reference to the user who owns this session
- `sessionToken` (String): Unique token for the session
- `expirationTime` (DateTime): Date and time the session expires
- `createdAt` (DateTime): Date and time the session was created

**Validation Rules**:
- References to valid user
- Session token must be unique
- Expiration time must be in the future

**Relationships**:
- Many Sessions belong to one User (userId → User.id)

## Entity Relationships

### User Relationships:
- User → CreditTransaction (1 to many)
- User → Image (1 to many) 
- User → Article (1 to many as author)
- User → Session (1 to many)

### Image Relationships:
- Image → Image (1 to 1 for original image reference)

## Database Constraints

1. **Unique Constraints**:
   - User.email: Email addresses must be unique
   - Session.sessionToken: Session tokens must be unique
   - AIModel.name: AI model names must be unique

2. **Foreign Key Constraints**:
   - CreditTransaction.userId → User.id
   - Image.userId → User.id
   - Image.originalImageId → Image.id
   - Article.authorId → User.id
   - Session.userId → User.id

3. **Check Constraints**:
   - CreditTransaction.amount ≠ 0: Transaction amounts must not be zero
   - Image.fileSize ≤ 52428800: File size limit of 50MB (50 * 1024 * 1024 bytes)
   - User.creditBalance ≥ 0: Credit balance cannot be negative

## Indexing Strategy

1. **Primary Indexes**: Automatically created for primary key fields
2. **Secondary Indexes**:
   - User.email: For authentication lookups
   - Image.userId: For user image queries
   - CreditTransaction.userId: For user transaction history
   - CreditTransaction.date: For chronological transaction queries
   - Session.sessionToken: For session validation
   - Article.publicationDate: For published article sorting

---
*Data model created as part of implementation planning for AI Image Generation and Editing Website*