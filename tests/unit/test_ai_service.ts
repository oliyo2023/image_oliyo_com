import { AIService } from '../../lib/services/ai-service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  aIModel: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  image: {
    create: jest.fn(),
  },
} as unknown as PrismaClient;

// Mock other services
const mockImageService = {
  createImage: jest.fn(),
  verifyImageOwnership: jest.fn(),
  findImageById: jest.fn(),
};

const mockCreditService = {
  hasSufficientCredits: jest.fn(),
  deductCredits: jest.fn(),
  getUserBalance: jest.fn(),
};

// Create instance of service with mocked dependencies
const aiService = new AIService();
(Object(aiService) as any).prisma = mockPrisma;
(Object(aiService) as any).imageService = mockImageService;
(Object(aiService) as any).creditService = mockCreditService;

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateImage', () => {
    it('should generate an image if user has sufficient credits', async () => {
      const mockInput = {
        userId: 'user-id-123',
        prompt: 'A beautiful landscape',
        aiModel: 'qwen-image-edit',
      };

      const mockModel = {
        id: 'model-id-1',
        name: 'qwen-image-edit',
        costPerUse: 5,
        isActive: true,
        usageCount: 10,
        lastAccessTime: new Date(),
      };

      const mockImage = {
        id: 'image-id-123',
        userId: 'user-id-123',
        originalFilename: 'generated-123.png',
        storagePath: '/images/generated-123.png',
        fileFormat: 'png',
        fileSize: 1024000,
        imageType: 'GENERATED',
        modelName: 'qwen-image-edit',
      };

      // Mock model lookup
      (mockPrisma.aIModel.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockModel);

      // Mock credit check
      (mockCreditService.hasSufficientCredits as jest.MockedFunction<any>).mockResolvedValue(true);

      // Mock credit deduction
      (mockCreditService.deductCredits as jest.MockedFunction<any>).mockResolvedValue({
        id: 'transaction-id-123',
        amount: -5,
      });

      // Mock model update
      (mockPrisma.aIModel.update as jest.MockedFunction<any>).mockResolvedValue({
        ...mockModel,
        usageCount: 11, // incremented
      });

      // Mock image creation
      (mockImageService.createImage as jest.MockedFunction<any>).mockResolvedValue(mockImage);

      // Mock final credit balance
      (mockCreditService.getUserBalance as jest.MockedFunction<any>).mockResolvedValue(95);

      const result = await aiService.generateImage(mockInput);

      expect(mockPrisma.aIModel.findUnique).toHaveBeenCalledWith({
        where: { name: 'qwen-image-edit' }
      });
      expect(mockCreditService.hasSufficientCredits).toHaveBeenCalledWith('user-id-123', 5);
      expect(mockCreditService.deductCredits).toHaveBeenCalledWith(
        'user-id-123',
        5,
        'Image generation using qwen-image-edit',
        'qwen-image-edit'
      );
      expect(mockPrisma.aIModel.update).toHaveBeenCalledWith({
        where: { name: 'qwen-image-edit' },
        data: {
          usageCount: { increment: 1 },
          lastAccessTime: expect.any(Date)
        }
      });
      expect(mockImageService.createImage).toHaveBeenCalledWith({
        userId: 'user-id-123',
        originalFilename: expect.any(String),
        storagePath: expect.any(String),
        prompt: 'A beautiful landscape',
        fileFormat: 'png',
        fileSize: 1024000,
        imageType: 'GENERATED',
        modelName: 'qwen-image-edit'
      });
      expect(result).toEqual({
        success: true,
        imageId: 'image-id-123',
        imageUrl: '/api/images/download/image-id-123',
        creditsUsed: 5,
        finalCreditBalance: 95,
        message: 'Image generated successfully'
      });
    });

    it('should return error for insufficient credits', async () => {
      const mockInput = {
        userId: 'user-id-123',
        prompt: 'A beautiful landscape',
        aiModel: 'qwen-image-edit',
      };

      const mockModel = {
        id: 'model-id-1',
        name: 'qwen-image-edit',
        costPerUse: 5,
        isActive: true,
      };

      // Mock model lookup
      (mockPrisma.aIModel.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockModel);

      // Mock insufficient credits
      (mockCreditService.hasSufficientCredits as jest.MockedFunction<any>).mockResolvedValue(false);

      // Mock user balance
      (mockCreditService.getUserBalance as jest.MockedFunction<any>).mockResolvedValue(2);

      const result = await aiService.generateImage(mockInput);

      expect(result).toEqual({
        success: false,
        error: 'Insufficient credits',
        requiredCredits: 5,
        currentCredits: 2
      });
    });

    it('should return error for inactive model', async () => {
      const mockInput = {
        userId: 'user-id-123',
        prompt: 'A beautiful landscape',
        aiModel: 'qwen-image-edit',
      };

      // Mock model lookup to return inactive model
      (mockPrisma.aIModel.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: 'model-id-1',
        name: 'qwen-image-edit',
        costPerUse: 5,
        isActive: false,
      });

      const result = await aiService.generateImage(mockInput);

      expect(result).toEqual({
        success: false,
        error: 'AI model qwen-image-edit is not available'
      });
    });
  });

  describe('editImage', () => {
    it('should edit an image if user has sufficient credits and owns the image', async () => {
      const mockInput = {
        userId: 'user-id-123',
        imageId: 'original-image-id',
        prompt: 'Add a sunset to the image',
        aiModel: 'gemini-flash-image',
      };

      const mockModel = {
        id: 'model-id-2',
        name: 'gemini-flash-image',
        costPerUse: 10,
        isActive: true,
      };

      const mockOriginalImage = {
        id: 'original-image-id',
        userId: 'user-id-123',
      };

      const mockEditedImage = {
        id: 'edited-image-id',
        userId: 'user-id-123',
        originalFilename: 'edited-123.png',
        storagePath: '/images/edited-123.png',
        fileFormat: 'png',
        fileSize: 1024000,
        imageType: 'EDITED',
        originalImageId: 'original-image-id',
        modelName: 'gemini-flash-image',
      };

      // Mock image ownership verification
      (mockImageService.verifyImageOwnership as jest.MockedFunction<any>).mockResolvedValue(true);

      // Mock original image lookup
      (mockImageService.findImageById as jest.MockedFunction<any>).mockResolvedValue(mockOriginalImage);

      // Mock model lookup
      (mockPrisma.aIModel.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockModel);

      // Mock credit check
      (mockCreditService.hasSufficientCredits as jest.MockedFunction<any>).mockResolvedValue(true);

      // Mock credit deduction
      (mockCreditService.deductCredits as jest.MockedFunction<any>).mockResolvedValue({
        id: 'transaction-id-123',
        amount: -10,
      });

      // Mock model update
      (mockPrisma.aIModel.update as jest.MockedFunction<any>).mockResolvedValue({
        ...mockModel,
        usageCount: 1, // incremented
      });

      // Mock edited image creation
      (mockImageService.createImage as jest.MockedFunction<any>).mockResolvedValue(mockEditedImage);

      // Mock final credit balance
      (mockCreditService.getUserBalance as jest.MockedFunction<any>).mockResolvedValue(90);

      const result = await aiService.editImage(mockInput);

      expect(mockImageService.verifyImageOwnership).toHaveBeenCalledWith('original-image-id', 'user-id-123');
      expect(mockImageService.findImageById).toHaveBeenCalledWith('original-image-id');
      expect(mockPrisma.aIModel.findUnique).toHaveBeenCalledWith({
        where: { name: 'gemini-flash-image' }
      });
      expect(mockCreditService.hasSufficientCredits).toHaveBeenCalledWith('user-id-123', 10);
      expect(mockCreditService.deductCredits).toHaveBeenCalledWith(
        'user-id-123',
        10,
        'Image editing using gemini-flash-image',
        'gemini-flash-image'
      );
      expect(mockImageService.createImage).toHaveBeenCalledWith({
        userId: 'user-id-123',
        originalFilename: expect.any(String),
        storagePath: expect.any(String),
        prompt: 'Add a sunset to the image',
        fileFormat: 'png',
        fileSize: 1024000,
        imageType: 'EDITED',
        originalImageId: 'original-image-id',
        modelName: 'gemini-flash-image'
      });
      expect(result).toEqual({
        success: true,
        imageId: 'edited-image-id',
        imageUrl: '/api/images/download/edited-image-id',
        creditsUsed: 10,
        finalCreditBalance: 90,
        originalImageId: 'original-image-id',
        message: 'Image edited successfully'
      });
    });

    it('should return error if user does not own the image', async () => {
      const mockInput = {
        userId: 'user-id-123',
        imageId: 'original-image-id',
        prompt: 'Add a sunset to the image',
        aiModel: 'gemini-flash-image',
      };

      // Mock image ownership verification to return false
      (mockImageService.verifyImageOwnership as jest.MockedFunction<any>).mockResolvedValue(false);

      const result = await aiService.editImage(mockInput);

      expect(result).toEqual({
        success: false,
        error: 'User does not own this image'
      });
    });

    it('should return error if original image not found', async () => {
      const mockInput = {
        userId: 'user-id-123',
        imageId: 'original-image-id',
        prompt: 'Add a sunset to the image',
        aiModel: 'gemini-flash-image',
      };

      // Mock image ownership verification to return true
      (mockImageService.verifyImageOwnership as jest.MockedFunction<any>).mockResolvedValue(true);

      // Mock original image lookup to return null
      (mockImageService.findImageById as jest.MockedFunction<any>).mockResolvedValue(null);

      const result = await aiService.editImage(mockInput);

      expect(result).toEqual({
        success: false,
        error: 'Original image not found'
      });
    });
  });

  describe('getModelByName', () => {
    it('should return the AI model if found', async () => {
      const mockModel = {
        id: 'model-id-1',
        name: 'qwen-image-edit',
        costPerUse: 5,
        isActive: true,
        usageCount: 10,
        lastAccessTime: new Date(),
      };

      (mockPrisma.aIModel.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockModel);

      const result = await aiService.getModelByName('qwen-image-edit');

      expect(mockPrisma.aIModel.findUnique).toHaveBeenCalledWith({
        where: { name: 'qwen-image-edit' }
      });
      expect(result).toEqual(mockModel);
    });

    it('should return null if model not found', async () => {
      (mockPrisma.aIModel.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      const result = await aiService.getModelByName('non-existent-model');

      expect(result).toBeNull();
    });
  });

  describe('getAvailableModels', () => {
    it('should return all active AI models', async () => {
      const mockModels = [
        {
          id: 'model-id-1',
          name: 'qwen-image-edit',
          costPerUse: 5,
          isActive: true,
          usageCount: 10,
          lastAccessTime: new Date(),
        },
        {
          id: 'model-id-2',
          name: 'gemini-flash-image',
          costPerUse: 10,
          isActive: true,
          usageCount: 5,
          lastAccessTime: new Date(),
        },
      ];

      (mockPrisma.aIModel.findMany as jest.MockedFunction<any>).mockResolvedValue(mockModels);

      const result = await aiService.getAvailableModels();

      expect(mockPrisma.aIModel.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
      expect(result).toEqual(mockModels);
    });
  });
});