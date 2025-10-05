import { CreditService } from '../../lib/services/credit-service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  creditTransaction: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
} as unknown as PrismaClient;

// Create instance of service with mocked prisma
const creditService = new CreditService();
(Object(creditService) as any).prisma = mockPrisma;

describe('CreditService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCreditTransaction', () => {
    it('should create a credit transaction and update user balance', async () => {
      const mockInput = {
        userId: 'user-id-123',
        transactionType: 'CREDIT_BONUS' as const,
        amount: 50,
        description: 'Welcome bonus',
      };

      const mockTransaction = {
        id: 'transaction-id-123',
        userId: 'user-id-123',
        transactionType: 'CREDIT_BONUS',
        amount: 50,
        description: 'Welcome bonus',
        date: new Date(),
        relatedModelName: null,
      };

      // Mock the transaction function
      (mockPrisma.$transaction as jest.MockedFunction<any>).mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      // Mock the individual operations within the transaction
      jest.spyOn(mockPrisma.creditTransaction, 'create').mockResolvedValue(mockTransaction);
      jest.spyOn(mockPrisma.user, 'update').mockResolvedValue({
        id: 'user-id-123',
        email: 'test@example.com',
        passwordHash: '$2a$12$examplehash',
        creditBalance: 150, // 100 + 50
        registrationDate: new Date(),
        lastLogin: new Date(),
        socialLoginProvider: null,
        isActive: true,
        role: 'user',
        concurrentRequests: 0,
      });

      const result = await creditService.createCreditTransaction(mockInput);

      expect(mockPrisma.creditTransaction.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-id-123',
          transactionType: 'CREDIT_BONUS',
          amount: 50,
          description: 'Welcome bonus',
          relatedModelName: undefined,
        }
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw error for zero amount', async () => {
      const mockInput = {
        userId: 'user-id-123',
        transactionType: 'CREDIT_BONUS' as const,
        amount: 0,
        description: 'Zero amount',
      };

      await expect(creditService.createCreditTransaction(mockInput))
        .rejects
        .toThrow('Transaction amount must not be zero');
    });
  });

  describe('deductCredits', () => {
    it('should deduct credits if user has sufficient balance', async () => {
      const userId = 'user-id-123';
      const amount = 10;
      const description = 'Image generation';

      // Mock user with sufficient credits
      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: userId,
        creditBalance: 50,
      });

      const mockTransaction = {
        id: 'transaction-id-123',
        userId,
        transactionType: 'IMAGE_GENERATION',
        amount: -10, // Negative for deduction
        description,
        date: new Date(),
        relatedModelName: null,
      };

      (mockPrisma.$transaction as jest.MockedFunction<any>).mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      (mockPrisma.creditTransaction.create as jest.MockedFunction<any>).mockResolvedValue(mockTransaction);

      const result = await creditService.deductCredits(userId, amount, description);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId }
      });
      expect(mockPrisma.creditTransaction.create).toHaveBeenCalledWith({
        data: {
          userId,
          transactionType: 'IMAGE_GENERATION',
          amount: -10,
          description,
          relatedModelName: undefined,
        }
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw error if user has insufficient credits', async () => {
      const userId = 'user-id-123';
      const amount = 50;
      const description = 'Image generation';

      // Mock user with insufficient credits
      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: userId,
        creditBalance: 10,
      });

      await expect(creditService.deductCredits(userId, amount, description))
        .rejects
        .toThrow(`Insufficient credits. Required: ${amount}, Available: 10`);
    });

    it('should throw error for non-positive amount', async () => {
      await expect(creditService.deductCredits('user-id', 0, 'desc'))
        .rejects
        .toThrow('Deduction amount must be positive');

      await expect(creditService.deductCredits('user-id', -5, 'desc'))
        .rejects
        .toThrow('Deduction amount must be positive');
    });
  });

  describe('addCredits', () => {
    it('should add credits to user account', async () => {
      const userId = 'user-id-123';
      const amount = 25;
      const description = 'Credit purchase';

      const mockTransaction = {
        id: 'transaction-id-123',
        userId,
        transactionType: 'CREDIT_PURCHASE',
        amount: 25,
        description,
        date: new Date(),
        relatedModelName: null,
      };

      (mockPrisma.$transaction as jest.MockedFunction<any>).mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      (mockPrisma.creditTransaction.create as jest.MockedFunction<any>).mockResolvedValue(mockTransaction);

      const result = await creditService.addCredits(userId, amount, description);

      expect(mockPrisma.creditTransaction.create).toHaveBeenCalledWith({
        data: {
          userId,
          transactionType: 'CREDIT_PURCHASE',
          amount: 25,
          description,
          relatedModelName: undefined,
        }
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw error for non-positive amount', async () => {
      await expect(creditService.addCredits('user-id', 0, 'desc'))
        .rejects
        .toThrow('Addition amount must be positive');

      await expect(creditService.addCredits('user-id', -5, 'desc'))
        .rejects
        .toThrow('Addition amount must be positive');
    });
  });

  describe('getUserTransactions', () => {
    it('should return user transactions', async () => {
      const userId = 'user-id-123';
      const mockTransactions = [
        {
          id: 'transaction-1',
          userId,
          transactionType: 'CREDIT_BONUS',
          amount: 100,
          description: 'Welcome bonus',
          date: new Date(),
        },
        {
          id: 'transaction-2',
          userId,
          transactionType: 'IMAGE_GENERATION',
          amount: -5,
          description: 'Image generation',
          date: new Date(),
        }
      ];

      (mockPrisma.creditTransaction.findMany as jest.MockedFunction<any>).mockResolvedValue(mockTransactions);

      const result = await creditService.getUserTransactions(userId);

      expect(mockPrisma.creditTransaction.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { date: 'desc' },
        skip: 0,
        take: 50
      });
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('getUserBalance', () => {
    it('should return user balance', async () => {
      const userId = 'user-id-123';
      const balance = 75;

      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: userId,
        creditBalance: balance,
      });

      const result = await creditService.getUserBalance(userId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { creditBalance: true }
      });
      expect(result).toBe(balance);
    });

    it('should return 0 if user not found', async () => {
      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      const result = await creditService.getUserBalance('non-existent');

      expect(result).toBe(0);
    });
  });
});