// Maximum file size: 50MB (as specified in requirements)
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

// Allowed image formats
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'];

/**
 * Validates image file size and format
 */
export function validateImage(fileSize: number, fileFormat: string): boolean {
  // Validate file size (max 50MB)
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File size too large. Maximum allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Validate file format
  const format = fileFormat.toLowerCase();
  if (!ALLOWED_FORMATS.includes(format)) {
    throw new Error(`Unsupported file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`);
  }

  return true;
}

/**
 * Validates image dimensions
 */
export function validateImageDimensions(width: number, height: number, maxWidth: number = 4000, maxHeight: number = 4000): boolean {
  if (width > maxWidth || height > maxHeight) {
    throw new Error(`Image dimensions too large. Maximum allowed: ${maxWidth}x${maxHeight}`);
  }
  
  return true;
}

/**
 * Sanitizes image metadata to prevent security issues
 */
export function sanitizeImageMetadata(metadata: Record<string, any>): Record<string, any> {
  // Remove potentially dangerous metadata fields
  const dangerousFields = [
    'script', 'exec', 'eval', 'javascript', 'vbscript', 
    'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus'
  ];
  
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    
    // Skip dangerous fields
    if (dangerousFields.some(field => lowerKey.includes(field))) {
      continue;
    }
    
    sanitized[key] = value;
  }
  
  return sanitized;
}

/**
 * Checks if a file has an image extension
 */
export function hasImageExtension(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? ALLOWED_FORMATS.includes(extension) : false;
}

/**
 * Gets the file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}