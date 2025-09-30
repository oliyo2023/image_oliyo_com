// src/lib/r2.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Create R2 client instance with Cloudflare R2 configuration
let r2Client: S3Client | null = null;

// Function to get R2 client (lazy initialization)
function getR2Client() {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto', // For Cloudflare R2, region should be 'auto'
      endpoint: process.env.R2_ENDPOINT || '', // Cloudflare R2 endpoint
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || ''
      },
      // R2 uses path-style addressing
      forcePathStyle: true,
    });
  }
  return r2Client;
}

// Function to upload image to R2 with security measures
export async function uploadImageToR2(fileBuffer: Buffer, fileName: string, contentType: string, userId: string) {
  try {
    // Validate file type and size before upload (additional security layer)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      throw new Error(`Invalid file type: ${contentType}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Limit file size to 50MB (52428800 bytes) as per requirements
    if (fileBuffer.length > 52428800) {
      throw new Error('File size exceeds 50MB limit');
    }

    // Sanitize filename to prevent path traversal attacks
    const sanitizedFileName = sanitizeFileName(fileName);
    const key = `users/${userId}/${sanitizedFileName}`;

    // Configure the upload parameters with security options
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME || 'your-bucket-name',
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // Add security headers
      Metadata: {
        'uploaded-by': userId,
        'upload-timestamp': new Date().toISOString()
      }
    };

    const client = getR2Client();
    const command = new PutObjectCommand(uploadParams);
    await client.send(command);

    // Return a secure URL for R2
    return {
      success: true,
      url: `${process.env.R2_PUBLIC_DOMAIN || process.env.R2_ENDPOINT || ''}/${key}`,
      key: key
    };
  } catch (error) {
    console.error('Error uploading image to R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Function to delete image from R2 with security measures
export async function deleteImageFromR2(fileKey: string, userId: string) {
  try {
    // Validate that the file key belongs to the user (security check)
    if (!fileKey.startsWith(`users/${userId}/`)) {
      throw new Error('Unauthorized: Cannot delete file belonging to another user');
    }

    // Sanitize the file key to prevent path traversal
    const sanitizedKey = sanitizeFileNameForPath(fileKey);

    const deleteParams = {
      Bucket: process.env.R2_BUCKET_NAME || 'your-bucket-name',
      Key: sanitizedKey
    };

    const client = getR2Client();
    const command = new DeleteObjectCommand(deleteParams);
    await client.send(command);

    return {
      success: true,
      message: 'File deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting image from R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Function to get a signed URL for secure image access from R2
export async function getImageSignedUrl(fileKey: string, userId: string, expiresIn: number = 3600) { // 1 hour default
  try {
    // Validate that the file key belongs to the user (security check)
    if (!fileKey.startsWith(`users/${userId}/`)) {
      throw new Error('Unauthorized: Cannot access file belonging to another user');
    }

    // Sanitize the file key to prevent path traversal
    const sanitizedKey = sanitizeFileNameForPath(fileKey);

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'your-bucket-name',
      Key: sanitizedKey
    });

    const client = getR2Client();
    // Generate a presigned URL that expires after specified time
    const signedUrl = await getSignedUrl(client, command, { expiresIn });

    return {
      success: true,
      url: signedUrl
    };
  } catch (error) {
    console.error('Error generating signed URL for image from R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Sanitize filename to prevent path traversal and other security issues
function sanitizeFileName(fileName: string): string {
  // Remove any path traversal attempts
  let sanitized = fileName.replace(/(\.\.\/|~\/|\.\.\\)/g, '');
  
  // Only allow alphanumeric characters, dots, hyphens, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Ensure the filename doesn't start with a dot (hidden files)
  if (sanitized.startsWith('.')) {
    sanitized = `file_${sanitized}`;
  }
  
  // Limit filename length
  if (sanitized.length > 255) {
    const ext = sanitized.slice(sanitized.lastIndexOf('.'));
    const name = sanitized.slice(0, sanitized.lastIndexOf('.'));
    sanitized = name.substring(0, 250 - ext.length) + ext;
  }
  
  return sanitized;
}

// Sanitize file path for R2 keys to prevent path traversal
function sanitizeFileNameForPath(filePath: string): string {
  // Remove any path traversal attempts
  let sanitized = filePath.replace(/(\.\.\/|~\/|\.\.\\)/g, '');
  
  // Only allow alphanumeric characters, dots, hyphens, underscores, and forward slashes
  sanitized = sanitized.replace(/[^a-zA-Z0-9._/-]/g, '_');
  
  // Ensure the path doesn't have double slashes
  sanitized = sanitized.replace(/\/+/g, '/');
  
  return sanitized;
}

// Additional security function to validate R2 configuration
export function validateR2Configuration(): boolean {
  const requiredEnvVars = [
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_ENDPOINT',
    'R2_BUCKET_NAME'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable for R2: ${envVar}`);
      return false;
    }
  }

  return true;
}

export default {
  uploadImageToR2,
  deleteImageFromR2,
  getImageSignedUrl,
  validateR2Configuration
};
