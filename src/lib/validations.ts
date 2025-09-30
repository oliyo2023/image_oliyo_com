// src/lib/validations.ts
import { z } from 'zod';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Common validation schemas

// User registration validation
export const userRegistrationSchema = z.object({
  email: z.string().min(1, 'Email is required').regex(emailRegex, 'Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User login validation
export const userLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').regex(emailRegex, 'Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Image upload validation
export const imageUploadSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(500, 'Prompt is too long'),
  model: z.string().min(1, 'Model is required'),
  width: z.number().min(1, 'Width must be positive').max(2048, 'Width too large').optional(),
  height: z.number().min(1, 'Height must be positive').max(2048, 'Height too large').optional(),
  style: z.string().optional()
});

// Image editing validation
export const imageEditSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(500, 'Prompt is too long'),
  model: z.string().min(1, 'Model is required'),
  originalImageId: z.string().min(1, 'Original image ID is required'),
  strength: z.number().min(0, 'Strength must be between 0 and 1').max(1, 'Strength must be between 0 and 1').optional()
});

// Credit purchase validation
export const creditPurchaseSchema = z.object({
  credits: z.number().refine(val => [100, 500, 1000].includes(val), 'Invalid credit package'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required')
});

// Article creation/validation schema
export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal(''))
});

// Validate file size and type for image uploads
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file size (max 50MB as specified in requirements)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is 50MB.`
    };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
}

// Validate credit deduction
export function validateCreditDeduction(creditBalance: number, cost: number): { isValid: boolean; error?: string } {
  if (creditBalance < cost) {
    return {
      isValid: false,
      error: `Insufficient credits. Required: ${cost}, Available: ${creditBalance}`
    };
  }

  if (cost <= 0) {
    return {
      isValid: false,
      error: 'Cost must be a positive number'
    };
  }

  return { isValid: true };
}

// Validate user role
export function validateUserRole(role: string): { isValid: boolean; error?: string } {
  const validRoles = ['user', 'admin'];
  if (!validRoles.includes(role)) {
    return {
      isValid: false,
      error: `Invalid role. Valid roles: ${validRoles.join(', ')}`
    };
  }
  
  return { isValid: true };
}

// Validate transaction type
export function validateTransactionType(type: string): { isValid: boolean; error?: string } {
  const validTypes = ['earned', 'spent', 'purchased'];
  if (!validTypes.includes(type)) {
    return {
      isValid: false,
      error: `Invalid transaction type. Valid types: ${validTypes.join(', ')}`
    };
  }
  
  return { isValid: true };
}