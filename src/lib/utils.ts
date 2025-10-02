// src/lib/utils.ts
// Common utility functions for the application

/**
 * Checks if a file type is valid based on content type
 */
export function isValidFileType(contentType: string): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(contentType.toLowerCase());
}

/**
 * Checks if a file size is valid (max 50MB)
 */
export function isValidFileSize(fileSize: number): boolean {
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  return fileSize > 0 && fileSize <= maxSize;
}

/**
 * Checks if image dimensions are valid (256x256 to 1024x1024)
 */
export function isValidImageDimensions(width: number, height: number): boolean {
  return width >= 256 && width <= 1024 && height >= 256 && height <= 1024;
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove script tags and other potentially dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');
}

/**
 * Generates a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Formats a credit amount for display
 */
export function formatCredits(credits: number): string {
  // Format as an integer string
  return credits.toFixed(0);
}

/**
 * Formats a monetary amount (in cents) to dollars
 */
export function formatCurrency(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Checks if a date is in the current week
 */
export function isThisWeek(date: Date): boolean {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  
  return date >= weekAgo && date <= today;
}

/**
 * Checks if a date is in the current month
 */
export function isThisMonth(date: Date): boolean {
  const today = new Date();
  return date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Delays execution for a specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}