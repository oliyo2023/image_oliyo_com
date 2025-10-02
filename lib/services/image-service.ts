import { PrismaClient, Image, User, AIModel } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { validateImage } from '../utils/image';

const prisma = new PrismaClient();

export interface CreateImageInput {
  userId: string;
  originalFilename: string;
  storagePath: string;
  prompt?: string;
  fileFormat: string;
  fileSize: number;
  imageType: 'UPLOADED' | 'GENERATED' | 'EDITED';
  originalImageId?: string;
  modelName?: string;
}

export interface UpdateImageInput {
  id: string;
  prompt?: string;
  status?: string;
}

export class ImageService {
  /**
   * Creates a new image record
   */
  async createImage(input: CreateImageInput): Promise<Image> {
    const { 
      userId, 
      originalFilename, 
      storagePath, 
      prompt, 
      fileFormat, 
      fileSize, 
      imageType, 
      originalImageId, 
      modelName 
    } = input;

    // Validate image properties
    validateImage(fileSize, fileFormat);

    // Create the image record
    return prisma.image.create({
      data: {
        userId,
        originalFilename,
        storagePath,
        prompt,
        fileFormat,
        fileSize,
        imageType,
        originalImageId,
        modelName,
        status: 'completed' // Default to completed unless processing is needed
      }
    });
  }

  /**
   * Finds an image by ID
   */
  async findImageById(id: string): Promise<Image | null> {
    return prisma.image.findUnique({
      where: { id }
    });
  }

  /**
   * Finds all images for a user
   */
  async getImagesByUserId(userId: string, limit?: number, offset?: number): Promise<Image[]> {
    return prisma.image.findMany({
      where: { userId },
      orderBy: { creationDate: 'desc' },
      skip: offset || 0,
      take: limit || 50
    });
  }

  /**
   * Updates an image record
   */
  async updateImage(input: UpdateImageInput): Promise<Image> {
    const { id, ...updateData } = input;
    
    return prisma.image.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Deletes an image record
   */
  async deleteImage(id: string): Promise<Image> {
    return prisma.image.delete({
      where: { id }
    });
  }

  /**
   * Links an edited image to its original
   */
  async linkToOriginalImage(editedImageId: string, originalImageId: string): Promise<Image> {
    return prisma.image.update({
      where: { id: editedImageId },
      data: { originalImageId }
    });
  }

  /**
   * Gets an image with its original (for edited images)
   */
  async getImageWithOriginal(id: string): Promise<(Image & { originalImage?: Image }) | null> {
    const image = await prisma.image.findUnique({
      where: { id },
      include: {
        originalImage: true
      }
    });

    return image;
  }

  /**
   * Gets user gallery (all images for the user)
   */
  async getUserGallery(userId: string): Promise<Image[]> {
    return prisma.image.findMany({
      where: { 
        userId,
        OR: [
          { imageType: 'GENERATED' },
          { imageType: 'EDITED' },
          { imageType: 'UPLOADED' }
        ]
      },
      orderBy: { creationDate: 'desc' }
    });
  }

  /**
   * Gets statistics about user's images
   */
  async getUserImageStats(userId: string) {
    const stats = await prisma.image.groupBy({
      by: ['imageType'],
      where: { userId },
      _count: true,
      _sum: {
        fileSize: true
      }
    });

    const totalImages = stats.reduce((sum, stat) => sum + stat._count, 0);
    const totalSize = stats.reduce((sum, stat) => sum + (stat._sum.fileSize || 0), 0);

    return {
      totalImages,
      totalSize,
      byType: stats
    };
  }

  /**
   * Verifies if a user owns an image
   */
  async verifyImageOwnership(imageId: string, userId: string): Promise<boolean> {
    const image = await prisma.image.findUnique({
      where: { id: imageId }
    });

    return image?.userId === userId;
  }
}