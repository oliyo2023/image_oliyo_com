# Manual Testing Guide: AI Image Generation and Editing Platform

## Overview
This document provides step-by-step instructions to manually test the core functionality of the AI Image Generation and Editing Platform. Follow these steps to ensure the system is working as specified.

## Pre-requisites
- A registered account with sufficient credits (or 100 free credits from registration)
- An image file to upload (if testing image editing feature)
- A text prompt for image generation/editing
- Cloudflare R2 account configured with appropriate credentials

## Test Scenarios

### 1. User Registration and Login
**Objective**: Verify that new users can register and existing users can log in.

**Steps**:
1. Navigate to the registration page
2. Enter a valid email address and secure password
3. Confirm the password
4. Complete the registration process
5. Verify that you receive 100 free credits upon registration
6. Log out and then log back in to verify authentication works

**Expected Result**: Account is created successfully, 100 credits are added, and login works with email/password.

### 2. Basic Image Generation
**Objective**: Verify that users can generate images from text prompts.

**Steps**:
1. Log into your account
2. Navigate to the "Generate Image" section
3. Enter a text prompt (e.g., "A beautiful landscape with mountains")
4. Select an AI model (qwen-image-edit or gemini-flash-image)
5. Adjust optional parameters (size, style) if desired
6. Click "Generate"
7. Wait for the image to be created
8. Verify that credits were deducted appropriately based on the selected model

**Expected Result**: An image is generated based on the text prompt, credits are deducted at the model-appropriate rate, and the image is displayed in your gallery.

### 3. Image Editing with Text Prompt
**Objective**: Verify that users can edit existing images using text prompts.

**Steps**:
1. Log into your account
2. Navigate to the "Edit Image" section
3. Upload an image file (ensure it's less than 50MB and in a supported format)
4. Enter a text prompt to modify the image (e.g., "Make the sky more blue and add clouds")
5. Select an AI model
6. Adjust strength parameter if desired
7. Click "Edit"
8. Wait for the image to be processed
9. Verify that credits were deducted appropriately

**Expected Result**: The uploaded image is modified according to the text prompt, credits are deducted, and the edited image is displayed in your gallery.

### 4. Credit Purchase
**Objective**: Verify that users can purchase additional credits.

**Steps**:
1. Navigate to the "Purchase Credits" section
2. Select a credit package (e.g., 100, 500, or 1000 credits)
3. Enter payment information
4. Complete the payment process
5. Verify that the credits have been added to your account

**Expected Result**: Payment is processed successfully and the correct number of credits are added to your account.

### 5. Admin Functionality
**Objective**: Verify that admin users have access to admin functions.

**Steps**:
1. Log into an admin account
2. Navigate to the admin dashboard
3. View the list of registered users
4. Check the credit consumption statistics
5. View AI model usage statistics
6. Create a new article or example
7. Verify the article appears publicly on the website

**Expected Result**: All admin functions work as expected, showing user data, usage statistics, and allowing content creation.

### 6. Social Login (if applicable)
**Objective**: Verify that users can log in using social providers.

**Steps**:
1. Return to the homepage
2. Click "Sign in with Google" or another social option
3. Complete the social authentication flow
4. Verify that a new account is created or existing account is accessed

**Expected Result**: Social login works as expected, creating an account if new or logging into an existing account.

## Success Criteria
- All user actions result in appropriate credit deductions
- AI model selection affects the number of credits consumed as specified
- Image generation and editing complete successfully within reasonable time
- User can access their generated and edited images in the gallery
- Admin dashboard accurately reflects user and usage data
- Payment processing completes without errors
- Images are properly stored and retrieved from Cloudflare R2

## Troubleshooting
- If image generation fails, verify that your account has sufficient credits
- If credits aren't deducted, check that the correct model was selected (with appropriate pricing)
- If uploads fail, ensure the image is less than 50MB and in a supported format
- If payment fails, verify payment method details
- If authentication fails, ensure the token is valid and not expired
- If images aren't stored properly, verify Cloudflare R2 configuration

## Additional Checks
1. Rate limiting: Verify that requests are limited appropriately to prevent abuse
2. Security measures: Verify that unauthorized access is prevented
3. File validation: Confirm that only allowed file types and sizes are accepted
4. Error handling: Test with invalid inputs and verify appropriate error messages
5. R2 integration: Verify that images are correctly uploaded to and retrieved from Cloudflare R2