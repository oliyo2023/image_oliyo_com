import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface ImageUploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export class ImageStorageService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'oliyo-images';
  }

  /**
   * Uploads an image buffer to S3 storage
   */
  async uploadImage(
    fileBuffer: Buffer,
    originalFilename: string,
    userId: string,
    imageType: string
  ): Promise<ImageUploadResult> {
    try {
      // Create a unique key for the image
      const fileExtension = originalFilename.split('.').pop();
      const key = `${userId}/${imageType}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExtension}`;

      // Create upload parameters
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: this.getContentType(fileExtension || ''),
        Metadata: {
          'original-filename': originalFilename,
          'uploaded-by': userId,
          'upload-date': new Date().toISOString(),
        },
      };

      // Create the upload
      const upload = new Upload({
        client: s3Client,
        params,
      });

      // Execute the upload
      await upload.done();

      // Return the public URL
      const imageUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

      return {
        success: true,
        url: imageUrl,
        key: key,
      };
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during upload'
      };
    }
  }

  /**
   * Deletes an image from S3 storage
   */
  async deleteImage(key: string): Promise<boolean> {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key,
      };

      await s3Client.send(new DeleteObjectCommand(deleteParams));
      return true;
    } catch (error) {
      console.error('Error deleting image from S3:', error);
      return false;
    }
  }

  /**
   * Gets the appropriate content type based on file extension
   */
  private getContentType(extension: string): string {
    const contentTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
      'svg': 'image/svg+xml',
    };

    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Generates a pre-signed URL for temporary access to a private image
   */
  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
    // Implementation would require the GetObjectCommand and presigner
    // This is simplified for now
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }
}