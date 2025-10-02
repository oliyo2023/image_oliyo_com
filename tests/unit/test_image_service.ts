import { ImageService } from '../../lib/services/image-service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  image: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
} as unknown as PrismaClient;

// Create instance of service with mocked prisma
const imageService = new ImageService();
(Object(imageService) as any).prisma = mockPrisma;

// Mock the validateImage function
jest.mock('../../lib/utils/image', () => ({
  validateImage: jest.fn(),
}));

describe('ImageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createImage', () => {
    it('should create a new image record', async () => {
      const mockInput = {
        userId: 'user-id-123',
        originalFilename: 'test-image.jpg',
        storagePath: '/images/test-image.jpg',
        fileFormat: 'jpg',
        fileSize: 1024000, // 1MB
        imageType: 'GENERATED' as const,
        prompt: 'A beautiful landscape',
        modelName: 'qwen-image-edit',
      };

      const mockCreatedImage = {
        id: 'image-id-123',
        ...mockInput,
        creationDate: new Date(),
        status: 'completed',
      };

      (mockPrisma.image.create as jest.MockedFunction<any>).mockResolvedValue(mockCreatedImage);

      const result = await imageService.createImage(mockInput);

      expect(mockPrisma.image.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-id-123',
          originalFilename: 'test-image.jpg',
          storagePath: '/images/test-image.jpg',
          prompt: 'A beautiful landscape',
          fileFormat: 'jpg',
          fileSize: 1024000,
          imageType: 'GENERATED',
          originalImageId: undefined,
          modelName: 'qwen-image-edit',
          status: 'completed',
        }
      });
      expect(result).toEqual(mockCreatedImage);
    });

    it('should call validateImage with correct parameters', async () => {
      const mockInput = {
        userId: 'user-id-123',
        originalFilename: 'test-image.jpg',
        storagePath: '/images/test-image.jpg',
        fileFormat: 'jpg',
        fileSize: 1024000, // 1MB
        imageType: 'UPLOADED' as const,
      };

      const mockCreatedImage = {
        id: 'image-id-123',
        ...mockInput,
        creationDate: new Date(),
        status: 'completed',
      };

      (mockPrisma.image.create as jest.MockedFunction<any>).mockResolvedValue(mockCreatedImage);

      await imageService.createImage(mockInput);

      expect(require('../../lib/utils/image').validateImage).toHaveBeenCalledWith(1024000, 'jpg');
    });
  });

  describe('findImageById', () => {
    it('should return image if found by ID', async () => {
      const mockImage = {
        id: 'image-id-123',
        userId: 'user-id-123',
        originalFilename: 'test-image.jpg',
        storagePath: '/images/test-image.jpg',
        fileFormat: 'jpg',
        fileSize: 1024000,
        imageType: 'GENERATED',
      };

      (mockPrisma.image.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockImage);

      const result = await imageService.findImageById('image-id-123');

      expect(mockPrisma.image.findUnique).toHaveBeenCalledWith({
        where: { id: 'image-id-123' }
      });
      expect(result).toEqual(mockImage);
    });

    it('should return null if image not found', async () => {
      (mockPrisma.image.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      const result = await imageService.findImageById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getImagesByUserId', () => {
    it('should return all images for a user', async () => {
      const userId = 'user-id-123';
      const mockImages = [
        {
          id: 'image-1',
          userId,
          originalFilename: 'image1.jpg',
          storagePath: '/images/image1.jpg',
          fileFormat: 'jpg',
          fileSize: 1024000,
          imageType: 'GENERATED',
        },
        {
          id: 'image-2',
          userId,
          originalFilename: 'image2.png',
          storagePath: '/images/image2.png',
          fileFormat: 'png',
          fileSize: 2048000,
          imageType: 'EDITED',
        }
      ];

      (mockPrisma.image.findMany as jest.MockedFunction<any>).mockResolvedValue(mockImages);

      const result = await imageService.getImagesByUserId(userId);

      expect(mockPrisma.image.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { creationDate: 'desc' },
        skip: 0,
        take: 50
      });
      expect(result).toEqual(mockImages);
    });
  });

  describe('updateImage', () => {
    it('should update an image record', async () => {
      const mockInput = {
        id: 'image-id-123',
        prompt: 'Updated prompt',
        status: 'completed',
      };

      const mockUpdatedImage = {
        id: 'image-id-123',
        userId: 'user-id-123',
        originalFilename: 'test-image.jpg',
        storagePath: '/images/test-image.jpg',
        fileFormat: 'jpg',
        fileSize: 1024000,
        imageType: 'GENERATED',
        prompt: 'Updated prompt',
        status: 'completed',
      };

      (mockPrisma.image.update as jest.MockedFunction<any>).mockResolvedValue(mockUpdatedImage);

      const result = await imageService.updateImage(mockInput);

      expect(mockPrisma.image.update).toHaveBeenCalledWith({
        where: { id: 'image-id-123' },
        data: {
          prompt: 'Updated prompt',
          status: 'completed',
        }
      });
      expect(result).toEqual(mockUpdatedImage);
    });
  });

  describe('deleteImage', () => {
    it('should delete an image record', async () => {
      const mockDeletedImage = {
        id: 'image-id-123',
        userId: 'user-id-123',
        originalFilename: 'test-image.jpg',
        storagePath: '/images/test-image.jpg',
        fileFormat: 'jpg',
        fileSize: 1024000,
        imageType: 'GENERATED',
      };

      (mockPrisma.image.delete as jest.MockedFunction<any>).mockResolvedValue(mockDeletedImage);

      const result = await imageService.deleteImage('image-id-123');

      expect(mockPrisma.image.delete).toHaveBeenCalledWith({
        where: { id: 'image-id-123' }
      });
      expect(result).toEqual(mockDeletedImage);
    });
  });

  describe('verifyImageOwnership', () => {
    it('should return true if user owns the image', async () => {
      const imageId = 'image-id-123';
      const userId = 'user-id-123';

      (mockPrisma.image.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: imageId,
        userId: userId,
      });

      const result = await imageService.verifyImageOwnership(imageId, userId);

      expect(result).toBe(true);
    });

    it('should return false if user does not own the image', async () => {
      const imageId = 'image-id-123';
      const userId = 'user-id-123';
      const differentUserId = 'different-user-id-456';

      (mockPrisma.image.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: imageId,
        userId: differentUserId,
      });

      const result = await imageService.verifyImageOwnership(imageId, userId);

      expect(result).toBe(false);
    });

    it('should return false if image does not exist', async () => {
      (mockPrisma.image.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      const result = await imageService.verifyImageOwnership('non-existent-id', 'user-id');

      expect(result).toBe(false);
    });
  });
});