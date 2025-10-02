// src/lib/r2.ts
// Cloudflare R2 client for secure image storage

import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Create R2 client using S3-compatible interface
// Cloudflare R2 is compatible with AWS S3 APIs
const r2Client = new S3Client({
  region: 'auto', // For Cloudflare R2, region is always 'auto'
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT, // e.g., 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com'
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Uploads an image to Cloudflare R2 storage
 * @param fileBuffer - The image file as a buffer
 * @param fileName - The name to give the file in storage
 * @param userId - The ID of the user uploading the image
 * @param contentType - The MIME type of the image
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToR2(
  fileBuffer: Buffer,
  fileName: string,
  userId: string,
  contentType: string
): Promise<string> {
  // Validate inputs
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('File buffer is required and cannot be empty');
  }

  if (!fileName || fileName.trim().length === 0) {
    throw new Error('File name is required');
  }

  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID is required');
  }

  // Validate content type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(contentType)) {
    throw new Error(`Invalid content type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Validate file size (max 50MB as per requirements)
  if (fileBuffer.length > 50 * 1024 * 1024) { // 50MB in bytes
    throw new Error('File size exceeds 50MB limit');
  }

  try {
    // Create a unique filename with user ID prefix to ensure user isolation
    const uniqueFileName = `${userId}/${Date.now()}-${fileName}`;
    
    // Create upload parameters
    const params = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'your-bucket-name',
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: {
        'user-id': userId,
        'upload-timestamp': new Date().toISOString(),
      }
    };

    // Perform the upload
    const upload = new Upload({
      client: r2Client,
      params
    });

    await upload.done();

    // Return the public URL
    // Note: The actual URL depends on your R2 configuration and any CDN setup
    // This assumes direct access through the R2 endpoint
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_R2_BUCKET_NAME}/${uniqueFileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image to R2:', error);
    throw new Error('Failed to upload image to storage');
  }
}

/**
 * Gets a signed URL for downloading a file from R2 (for private access)
 * @param fileName - The name of the file in storage
 * @param expiresIn - Number of seconds until the URL expires (default: 3600)
 * @returns A signed URL for accessing the file
 */
export async function getSignedUrlForR2File(
  fileName: string,
  expiresIn: number = 3600
): Promise<string> {
  // Note: This is a simplified example. For actual signed URL generation,
  // you would need to use the GetObjectCommand and a signing function
  // from the AWS SDK, which is not implemented here for brevity.
  // In a real implementation you would import the GetObjectCommand 
  // and use the S3RequestPresigner to create signed URLs.
  
  // For now, we'll return a placeholder that would need to be implemented
  // with the actual AWS SDK signing functionality
  throw new Error('Signed URL generation not implemented in this simplified version');
}

/**
 * Deletes a file from R2 storage
 * @param fileName - The name of the file in storage
 * @param userId - The ID of the user who owns the file (for security validation)
 * @returns Boolean indicating success or failure
 */
export async function deleteFileFromR2(
  fileName: string,
  userId: string
): Promise<boolean> {
  // In a real implementation, you would validate that the file belongs to the user
  // and then delete it using the DeleteObjectCommand from the AWS SDK
  
  console.log(`Deleting file: ${fileName} for user: ${userId}`);
  
  // Placeholder implementation - in a real app, you would implement the actual deletion
  return true;
}

/**
 * Validates an image file before upload
 * @param fileBuffer - The image file as a buffer
 * @param fileName - The name of the file
 * @param contentType - The MIME type of the file
 * @param userId - The ID of the user uploading
 * @returns Boolean indicating if the file is valid
 */
export async function validateImageForR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  userId: string
): Promise<boolean> {
  try {
    // Check file type based on content type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      throw new Error(`Unsupported file type: ${contentType}`);
    }

    // Check file size (max 50MB as per requirements)
    if (fileBuffer.length === 0) {
      throw new Error('File is empty');
    }
    
    if (fileBuffer.length > 50 * 1024 * 1024) { // 50MB in bytes
      throw new Error('File size exceeds 50MB limit');
    }

    // Check file extension based on actual file content if needed (more thorough validation)
    // This is a simplified check - in production, use a library like file-type for validation
    const fileExtension = fileName.toLowerCase().split('.').pop();
    const mimeToExtension: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/webp': ['webp'],
      'image/gif': ['gif'],
    };

    if (fileExtension && mimeToExtension[contentType]) {
      if (!mimeToExtension[contentType].includes(fileExtension)) {
        console.warn(`File extension ${fileExtension} doesn't match content type ${contentType}, but proceeding.`);
        // In a real app, you might want to be stricter about this
      }
    }

    return true;
  } catch (error) {
    console.error('Image validation error:', error);
    return false;
  }
}

/**
 * Implements security measures for image storage
 * @param fileBuffer - The image file as a buffer
 * @param userId - The ID of the user uploading the image
 * @returns Boolean indicating if the file passed security checks
 */
export async function applySecurityMeasures(
  fileBuffer: Buffer,
  userId: string
): Promise<boolean> {
  try {
    // 1. Validate that the file is actually an image (not a disguised executable)
    // For this simplified implementation, we'll perform basic checks
    // In a production environment, you would use libraries like 'file-type' or 'sharp'
    // to verify the file signature
    
    // Basic check: ensure the buffer starts with common image file signatures
    if (fileBuffer.length < 10) {
      throw new Error('File is too small to be a valid image');
    }
    
    // JPEG files start with FF D8
    const isJpeg = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8;
    
    // PNG files start with 89 50 4E 47
    const isPng = fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && 
                 fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47;
    
    // GIF files start with 47 49 46 38
    const isGif = fileBuffer[0] === 0x47 && fileBuffer[1] === 0x49 && 
                 fileBuffer[2] === 0x46 && fileBuffer[3] === 0x38;
    
    // If it's not one of the expected image types, it could be malicious
    if (!isJpeg && !isPng && !isGif) {
      // Additional check: make sure it's not an executable file
      // Executable files often start with MZ (for Windows executables)
      if (fileBuffer[0] === 0x4D && fileBuffer[1] === 0x5A) {
        throw new Error('Potential executable file detected - upload blocked for security');
      }
    }
    
    // 2. Verify the file doesn't contain malicious code
    // This is a simplified check - in production, you'd want to use specialized security scanning
    // For now, we'll just check for common exploit patterns in the first few bytes
    
    // Check if the file type matches its extension when possible
    // This is a basic check and not comprehensive security measure
    
    // 3. Apply user-specific security checks
    // In a real implementation, you might check if the user has been flagged,
    // or apply different security rules based on user permissions
    
    // 4. Apply metadata sanitization
    // In a full implementation, you'd want to strip potentially malicious metadata
    // such as EXIF data that could contain exploits
    
    console.log(`Security checks passed for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Security validation failed:', error);
    return false;
  }
}

/**
 * Sanitizes image metadata to remove potentially malicious data
 * @param fileBuffer - The image file as a buffer
 * @returns Cleaned buffer without potentially harmful metadata
 */
export async function sanitizeImageMetadata(
  fileBuffer: Buffer
): Promise<Buffer> {
  // In a real implementation, you would use a library like 'sharp' to strip metadata
  // For this simplified implementation, we'll just return the buffer as is
  // since we don't have the image processing libraries installed
  
  // In a real app, you'd do something like this:
  /*
  const sharp = require('sharp');
  return await sharp(fileBuffer)
    .withMetadata() // This would strip EXIF data and other metadata
    .toBuffer();
  */
  
  // For now, just return the original buffer
  // This is not a real implementation of metadata sanitization
  return fileBuffer;
}