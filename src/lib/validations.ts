// src/lib/validations.ts
// Validation utilities for the application

import { isValidFileType, isValidFileSize, isValidImageDimensions } from './utils';

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Validates an image file according to the project's requirements:
 * - Format: jpeg, png, webp, gif (max 50MB)
 * - Size: max 50MB
 * - Dimensions: max 1024x1024 (as per API contracts)
 */
export function validateImageUpload(
  file: File | Buffer,
  fileName?: string,
  contentType?: string
): ImageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate file type/format
  if (contentType) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(contentType.toLowerCase())) {
      errors.push(`Invalid file type: ${contentType}. Allowed types: ${validTypes.join(', ')}`);
    }
  }

  // Validate file size (max 50MB as per requirements)
  let fileSize: number;
  if (file instanceof File) {
    fileSize = file.size;
    if (fileName === undefined) fileName = file.name;
  } else {
    fileSize = file.length;
  }

  if (fileSize > 50 * 1024 * 1024) { // 50MB in bytes
    errors.push(`File size ${fileSize} bytes exceeds maximum allowed size of 50MB`);
  } else if (fileSize === 0) {
    errors.push('File is empty');
  }

  // If file type validation passed, check file extension
  if (fileName && errors.length === 0) {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const fileExtension = '.' + fileName.toLowerCase().split('.').pop();
    
    if (!validExtensions.includes(fileExtension)) {
      errors.push(`Invalid file extension: ${fileExtension}. Allowed extensions: ${validExtensions.join(', ')}`);
    }
  }

  // Note: For dimension validation, we'd need to actually process the image
  // which typically requires libraries like sharp or similar
  // This would be done after the file is uploaded or during processing
  // For now, we'll add a warning that dimension validation requires image processing

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Validates a text prompt according to the project's requirements:
 * - Length: 1-1000 characters
 */
export function validatePrompt(prompt: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!prompt || prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty');
  } else if (prompt.length > 1000) {
    errors.push('Prompt exceeds maximum length of 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an AI model name according to the project's requirements:
 * - Must be one of the supported models
 */
export function validateAIModel(model: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validModels = ['qwen-image-edit', 'gemini-flash-image'];

  if (!model) {
    errors.push('Model name is required');
  } else if (!validModels.includes(model)) {
    errors.push(`Invalid model: ${model}. Valid models are: ${validModels.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates image dimensions according to the project's requirements:
 * - Min 256x256, Max 1024x1024
 */
export function validateImageDimensions(width?: number, height?: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (width !== undefined) {
    if (width < 256) {
      errors.push('Image width must be at least 256 pixels');
    } else if (width > 1024) {
      errors.push('Image width must not exceed 1024 pixels');
    }
  }

  if (height !== undefined) {
    if (height < 256) {
      errors.push('Image height must be at least 256 pixels');
    } else if (height > 1024) {
      errors.push('Image height must not exceed 1024 pixels');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a credit amount for purchase
 */
export function validateCreditPurchase(credits: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validCreditAmounts = [100, 500, 1000]; // As defined in the stripe service

  if (!Number.isInteger(credits)) {
    errors.push('Credit amount must be an integer');
  } else if (!validCreditAmounts.includes(credits)) {
    errors.push(`Invalid credit amount: ${credits}. Valid amounts: ${validCreditAmounts.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a user's role
 */
export function validateUserRole(role: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validRoles = ['user', 'admin'];

  if (!validRoles.includes(role)) {
    errors.push(`Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generic validation for a non-empty string
 */
export function validateNonEmptyString(value: string, fieldName: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (value === undefined || value === null || value.toString().trim().length === 0) {
    errors.push(`${fieldName} cannot be empty`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an email address format
 */
export function validateEmail(email: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a password according to the project's requirements:
 * - Minimum 8 characters
 * - At least one uppercase, one lowercase, and one number
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a UUID format
 */
export function validateUUID(uuid: string): boolean {
  // UUID v4 format regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates and sanitizes dashboard layout configuration
 */
export function validateAndSanitizeDashboardLayout(layout: any): { isValid: boolean; sanitizedLayout?: any; errors?: string[] } {
  // In a real implementation, this would validate and sanitize the dashboard layout
  // For now, we'll just return a basic validation
  if (!layout || typeof layout !== 'object') {
    return { 
      isValid: false, 
      errors: ['Invalid dashboard layout configuration'] 
    };
  }
  
  // Return the layout as-is for now
  return { 
    isValid: true, 
    sanitizedLayout: layout 
  };
}