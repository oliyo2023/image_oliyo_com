# Quickstart Guide: AI Image Generation and Editing Website

## Overview
This guide will help you set up and use the AI Image Generation and Editing Website with credit-based system.

## Prerequisites
- Node.js 18+ and npm/pnpm
- Access to qwen-image-edit and gemini-flash-image APIs
- Database (PostgreSQL recommended)
- Image storage solution

## Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd oliyo.com
pnpm install  # or npm install
```

### 2. Configure Environment Variables
Create a `.env` file with:
```
DATABASE_URL=your_database_connection_string
QWEN_API_KEY=your_qwen_api_key
GEMINI_API_KEY=your_gemini_api_key
NEXTAUTH_SECRET=your_nextauth_secret
CLOUDINARY_URL=your_cloudinary_url  # or other image storage
```

### 3. Run Database Migrations
```bash
npx prisma db push  # or your preferred migration command
```

### 4. Start Development Server
```bash
pnpm dev  # or npm run dev
```

The application should now be running at `http://localhost:3000`

## User Workflow Test

### 1. Register New User
1. Navigate to `/auth/register`
2. Enter valid email and password
3. Verify account is created with 100 free credits
4. Check that user is logged in automatically

### 2. Generate New Image
1. Go to `/dashboard` or `/editor`
2. Enter a text prompt (e.g., "A futuristic city skyline")
3. Select an AI model (qwen-image-edit costs 5 credits, gemini-flash-image costs 10)
4. Click "Generate"
5. Verify:
   - Image is generated successfully
   - 5 or 10 credits are deducted from balance
   - New image appears in user's gallery

### 3. Upload and Edit Existing Image
1. Go to `/gallery` and click "Upload Image"
2. Upload an image file (under 50MB)
3. Select the uploaded image for editing
4. Enter a text prompt to edit the image (e.g., "Add a sunset to the sky")
5. Select an AI model and click "Edit"
6. Verify:
   - Image is edited as requested
   - Appropriate credits are deducted
   - Edited image is saved to user's gallery

### 4. Purchase Additional Credits
1. Go to `/dashboard`
2. When credits are low (or at 0), click "Purchase Credits"
3. Complete the purchase flow
4. Verify:
   - Credits are added to user's balance
   - Transaction is recorded in credit history

### 5. Admin Functions
1. Log in as admin user at `/admin`
2. Verify:
   - User management interface is accessible
   - Credit consumption statistics are available
   - Article creation/publishing interface is available

## Expected Results
- All user registration, authentication, and authorization flows work correctly
- Image generation and editing operations complete successfully
- Credit deductions are accurately calculated and applied
- All operations are logged and auditable
- System maintains 95% uptime and API response times under 2 seconds