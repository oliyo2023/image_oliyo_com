// src/lib/validations.ts
// Input validation and sanitization utilities

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns boolean - Whether email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object - Validation result with details
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate role name format
 * @param roleName - Role name to validate
 * @returns boolean - Whether role name is valid
 */
export function validateRoleName(roleName: string): boolean {
  // Role name should be alphanumeric with dashes and underscores allowed
  const roleNameRegex = /^[a-zA-Z0-9_-]+$/;
  return roleNameRegex.test(roleName) && roleName.length >= 2 && roleName.length <= 50;
}

/**
 * Validate permission name format
 * @param permissionName - Permission name to validate
 * @returns boolean - Whether permission name is valid
 */
export function validatePermissionName(permissionName: string): boolean {
  // Permission name should be in format "resource.action" or "resource.subresource.action"
  const permissionNameRegex = /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/;
  return permissionNameRegex.test(permissionName) && permissionName.length >= 3 && permissionName.length <= 100;
}

/**
 * Validate UUID format
 * @param uuid - UUID to validate
 * @returns boolean - Whether UUID is valid
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize string input to prevent XSS attacks
 * @param input - String to sanitize
 * @returns string - Sanitized string
 */
export function sanitizeString(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate and sanitize user input object
 * @param input - Object containing user input
 * @param allowedKeys - Array of allowed keys
 * @returns Object - Sanitized input object
 */
export function validateAndSanitizeInput(input: any, allowedKeys: string[]): any {
  const sanitizedInput: any = {};

  // Only process allowed keys
  allowedKeys.forEach(key => {
    if (input.hasOwnProperty(key)) {
      const value = input[key];
      
      // Sanitize string values
      if (typeof value === 'string') {
        sanitizedInput[key] = sanitizeString(value);
      } 
      // Handle arrays
      else if (Array.isArray(value)) {
        sanitizedInput[key] = value.map(item => 
          typeof item === 'string' ? sanitizeString(item) : item
        );
      } 
      // Handle objects recursively
      else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitizedInput[key] = validateAndSanitizeInput(value, Object.keys(value));
      } 
      // Pass through other values (numbers, booleans, etc.)
      else {
        sanitizedInput[key] = value;
      }
    }
  });

  return sanitizedInput;
}

/**
 * Validate pagination parameters
 * @param limit - Limit parameter
 * @param offset - Offset parameter
 * @returns Object - Validated pagination parameters
 */
export function validatePaginationParams(limit: any, offset: any): { limit: number; offset: number } {
  // Convert to numbers
  const limitNum = parseInt(limit, 10);
  const offsetNum = parseInt(offset, 10);

  // Set defaults if invalid
  const validatedLimit = isNaN(limitNum) || limitNum <= 0 || limitNum > 100 ? 20 : limitNum;
  const validatedOffset = isNaN(offsetNum) || offsetNum < 0 ? 0 : offsetNum;

  return {
    limit: validatedLimit,
    offset: validatedOffset
  };
}

/**
 * Validate sort parameters
 * @param sortBy - Sort by parameter
 * @param sortOrder - Sort order parameter
 * @param allowedSortFields - Array of allowed sort fields
 * @returns Object - Validated sort parameters
 */
export function validateSortParams(
  sortBy: any,
  sortOrder: any,
  allowedSortFields: string[]
): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  // Validate sort field
  const validatedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

  // Validate sort order
  const validatedSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';

  return {
    sortBy: validatedSortBy,
    sortOrder: validatedSortOrder
  };
}

/**
 * Validate date range parameters
 * @param startDate - Start date parameter
 * @param endDate - End date parameter
 * @param maxDays - Maximum number of days allowed in range (default: 365)
 * @returns Object - Validated date range or error
 */
export function validateDateRange(
  startDate: any,
  endDate: any,
  maxDays: number = 365
): { isValid: boolean; startDate?: Date; endDate?: Date; error?: string } {
  try {
    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (isNaN(start.getTime())) {
      return {
        isValid: false,
        error: 'Invalid start date'
      };
    }

    if (isNaN(end.getTime())) {
      return {
        isValid: false,
        error: 'Invalid end date'
      };
    }

    // Ensure start date is before end date
    if (start > end) {
      return {
        isValid: false,
        error: 'Start date must be before end date'
      };
    }

    // Check date range is not too large
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    if (dayDiff > maxDays) {
      return {
        isValid: false,
        error: `Date range cannot exceed ${maxDays} days`
      };
    }

    return {
      isValid: true,
      startDate: start,
      endDate: end
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Error validating date range'
    };
  }
}

/**
 * Validate and sanitize URL parameters
 * @param params - URL parameters object
 * @returns Object - Validated and sanitized parameters
 */
export function validateAndSanitizeURLParams(params: any): any {
  const sanitizedParams: any = {};

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const value = params[key];
      
      // Sanitize string values
      if (typeof value === 'string') {
        sanitizedParams[key] = sanitizeString(value);
      } 
      // Parse numeric values
      else if (typeof value === 'string' && !isNaN(Number(value))) {
        sanitizedParams[key] = Number(value);
      } 
      // Pass through other values
      else {
        sanitizedParams[key] = value;
      }
    }
  }

  return sanitizedParams;
}

/**
 * Validate JSON input
 * @param jsonString - JSON string to validate
 * @returns Object - Parsed JSON or error
 */
export function validateJSON(jsonString: string): { isValid: boolean; data?: any; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    return {
      isValid: true,
      data
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid JSON format'
    };
  }
}

/**
 * Validate and sanitize query parameters for search
 * @param query - Search query string
 * @param maxLength - Maximum allowed query length (default: 100)
 * @returns Object - Validated and sanitized query or error
 */
export function validateAndSanitizeSearchQuery(
  query: string,
  maxLength: number = 100
): { isValid: boolean; query?: string; error?: string } {
  // Check if query is provided
  if (!query || query.trim().length === 0) {
    return {
      isValid: false,
      error: 'Search query is required'
    };
  }

  // Check query length
  if (query.length > maxLength) {
    return {
      isValid: false,
      error: `Search query cannot exceed ${maxLength} characters`
    };
  }

  // Sanitize query
  const sanitizedQuery = sanitizeString(query.trim());

  return {
    isValid: true,
    query: sanitizedQuery
  };
}

/**
 * Validate file upload parameters
 * @param fileName - Name of the file
 * @param fileSize - Size of the file in bytes
 * @param mimeType - MIME type of the file
 * @param maxSize - Maximum allowed file size in bytes (default: 50MB)
 * @param allowedTypes - Array of allowed MIME types
 * @returns Object - Validation result
 */
export function validateFileUpload(
  fileName: string,
  fileSize: number,
  mimeType: string,
  maxSize: number = 50 * 1024 * 1024, // 50MB default
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
): { isValid: boolean; error?: string } {
  // Validate file name
  if (!fileName || fileName.trim().length === 0) {
    return {
      isValid: false,
      error: 'File name is required'
    };
  }

  // Validate file size
  if (fileSize <= 0) {
    return {
      isValid: false,
      error: 'Invalid file size'
    };
  }

  if (fileSize > maxSize) {
    return {
      isValid: false,
      error: `File size cannot exceed ${maxSize / (1024 * 1024)}MB`
    };
  }

  // Validate MIME type
  if (!allowedTypes.includes(mimeType)) {
    return {
      isValid: false,
      error: `File type ${mimeType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return {
    isValid: true
  };
}

/**
 * Validate and sanitize dashboard layout configuration
 * @param layout - Dashboard layout configuration
 * @returns Object - Validated layout or error
 */
export function validateAndSanitizeDashboardLayout(layout: any): { isValid: boolean; layout?: any; error?: string } {
  // Check if layout is provided
  if (!layout || typeof layout !== 'object') {
    return {
      isValid: false,
      error: 'Dashboard layout is required and must be an object'
    };
  }

  // Validate widgets array
  if (!Array.isArray(layout.widgets)) {
    return {
      isValid: false,
      error: 'Layout must contain a widgets array'
    };
  }

  // Validate each widget
  const sanitizedWidgets = layout.widgets.map((widget: any) => {
    if (!widget || typeof widget !== 'object') {
      return null;
    }

    // Validate required fields
    if (!widget.id || typeof widget.id !== 'string') {
      return null;
    }

    if (!widget.position || typeof widget.position !== 'object') {
      return null;
    }

    // Validate position fields
    if (typeof widget.position.x !== 'number' || 
        typeof widget.position.y !== 'number' ||
        typeof widget.position.width !== 'number' ||
        typeof widget.position.height !== 'number') {
      return null;
    }

    // Sanitize widget ID and return sanitized widget
    return {
      id: sanitizeString(widget.id),
      position: {
        x: widget.position.x,
        y: widget.position.y,
        width: widget.position.width,
        height: widget.position.height
      }
    };
  }).filter((widget: any) => widget !== null);

  // If any widgets failed validation
  if (sanitizedWidgets.length !== layout.widgets.length) {
    return {
      isValid: false,
      error: 'One or more widgets failed validation'
    };
  }

  // Return sanitized layout
  return {
    isValid: true,
    layout: {
      widgets: sanitizedWidgets,
      gridConfig: layout.gridConfig || {
        columns: 4,
        rowHeight: 150,
        margin: [10, 10]
      }
    }
  };
}