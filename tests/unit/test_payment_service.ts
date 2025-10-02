// Unit tests for payment service
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createPurchaseIntent, confirmPayment, getUserCreditBalance, getUserCreditHistory, getTotalCreditsSpent, getTotalCreditsEarned, getTotalCreditsPurchased } from '@/lib/stripe';
import { User } from '@prisma/client';
import { Stripe } from 'stripe';

// Mock dependencies
jest.mock('stripe');
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    purchaseIntent: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('Payment Service Unit Tests', () => {
  const mockUser: User = {
    id: 'user_123456789',
    email: 'test@example.com',
    passwordHash: '$2a$12$examplehash', // Mocked bcrypt hash
    creditBalance: 100,
    registrationDate: new Date(),
    lastLogin: new Date(),
    socialLoginProvider: null,
    isActive: true,
    role: 'user',
    concurrentRequests: 0,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore all mocks after each test
    jest.restoreAllMocks();
  });

  describe('createPurchaseIntent', () => {
    it('should create a purchase intent with valid input', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (Stripe as unknown as jest.Mock).mockImplementation(() => ({
        paymentIntents: {
          create: jest.fn().mockResolvedValue({
            id: 'pi_123456789',
            client_secret: 'pi_123456789_secret_abc123',
            status: 'requires_confirmation',
            amount: 999,
            currency: 'usd',
          }),
        },
      }));
      (prisma.purchaseIntent.create as jest.Mock).mockResolvedValue({
        id: 'purchase_123456789',
        paymentIntentId: 'pi_123456789',
        userId: mockUser.id,
        credits: 100,
        amount: 999,
        status: 'created',
        confirmed: false,
        confirmedAt: null,
        createdAt: new Date(),
      });

      const result = await createPurchaseIntent(mockUser.id, 100);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Purchase intent created successfully');
      expect(result.paymentIntentId).toBe('pi_123456789');
      expect(result.clientSecret).toBe('pi_123456789_secret_abc123');
      expect(result.amount).toBe(999);
      expect(result.credits).toBe(100);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(Stripe).toHaveBeenCalledWith(process.env.STRIPE_SECRET_KEY);
      expect(prisma.purchaseIntent.create).toHaveBeenCalledWith({
        data: {
          paymentIntentId: 'pi_123456789',
          userId: mockUser.id,
          credits: 100,
          amount: 999,
          status: 'created',
        },
      });
    });

    it('should return error for invalid credit amount', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await createPurchaseIntent(mockUser.id, 250); // Invalid amount

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credit amount. Valid amounts: 100, 500, 1000');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should return error for user not found', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await createPurchaseIntent('nonexistent_user', 100);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent_user' },
      });
    });

    it('should handle Stripe API errors gracefully', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (Stripe as unknown as jest.Mock).mockImplementation(() => ({
        paymentIntents: {
          create: jest.fn().mockRejectedValue(new Error('Stripe API error')),
        },
      }));

      const result = await createPurchaseIntent(mockUser.id, 100);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Stripe API error');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(Stripe).toHaveBeenCalledWith(process.env.STRIPE_SECRET_KEY);
    });

    it('should handle database errors gracefully', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (Stripe as unknown as jest.Mock).mockImplementation(() => ({
        paymentIntents: {
          create: jest.fn().mockResolvedValue({
            id: 'pi_123456789',
            client_secret: 'pi_123456789_secret_abc123',
            status: 'requires_confirmation',
            amount: 999,
            currency: 'usd',
          }),
        },
      }));
      (prisma.purchaseIntent.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await createPurchaseIntent(mockUser.id, 100);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Database error');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(Stripe).toHaveBeenCalledWith(process.env.STRIPE_SECRET_KEY);
      expect(prisma.purchaseIntent.create).toHaveBeenCalledWith({
        data: {
          paymentIntentId: 'pi_123456789',
          userId: mockUser.id,
          credits: 100,
          amount: 999,
          status: 'requires_confirmation',
        },
      });
    });

    it('should validate input parameters', async () => {
      // Test with negative credits
      const result1 = await createPurchaseIntent(mockUser.id, -100);

      expect(result1).toBeDefined();
      expect(result1.success).toBe(false);
      expect(result1.message).toBe('Invalid credit amount. Valid amounts: 100, 500, 1000');

      // Test with zero credits
      const result2 = await createPurchaseIntent(mockUser.id, 0);

      expect(result2).toBeDefined();
      expect(result2.success).toBe(false);
      expect(result2.message).toBe('Invalid credit amount. Valid amounts: 100, 500, 1000');

      // Test with non-integer credits
      const result3 = await createPurchaseIntent(mockUser.id, 150.5);

      expect(result3).toBeDefined();
      expect(result3.success).toBe(false);
      expect(result3.message).toBe('Invalid credit amount. Valid amounts: 100, 500, 1000');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment and add credits with valid input', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.purchaseIntent.findUnique as jest.Mock).mockResolvedValue({
        id: 'purchase_123456789',
        paymentIntentId: 'pi_123456789',
        userId: mockUser.id,
        credits: 100,
        amount: 999,
        status: 'created',
        confirmed: false,
        confirmedAt: null,
        createdAt: new Date(),
      });
      (Stripe as unknown as jest.Mock).mockImplementation(() => ({
        paymentIntents: {
          retrieve: jest.fn().mockResolvedValue({
            id: 'pi_123456789',
            status: 'succeeded',
            amount: 999,
            currency: 'usd',
          }),
        },
      }));
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, creditBalance: 200 });
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(prisma);
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, creditBalance: 200 });
      (prisma.creditTransaction.create as jest.Mock).mockResolvedValue({
        id: 'txn_123456789',
        userId: mockUser.id,
        transactionType: 'purchased',
        amount: 100,
        date: new Date(),
        description: 'Credit purchase: 100 credits ($9.99)',
        relatedModelName: null,
      });
      (prisma.purchaseIntent.update as jest.Mock).mockResolvedValue({
        id: 'purchase_123456789',
        paymentIntentId: 'pi_123456789',
        userId: mockUser.id,
        credits: 100,
        amount: 999,
        status: 'succeeded',
        confirmed: true,
        confirmedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await confirmPayment({ paymentIntentId: 'pi_123456789', userId: mockUser.id });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment confirmed and credits added');
      expect(result.newBalance).toBe(200);
      expect(result.creditsAdded).toBe(100);
      expect(prisma.purchaseIntent.findUnique).toHaveBeenCalledWith({
        where: { paymentIntentId: 'pi_123456789' },
      });
      expect(Stripe).toHaveBeenCalledWith(process.env.STRIPE_SECRET_KEY);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { creditBalance: { increment: 100 } },
      });
      expect(prisma.creditTransaction.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          transactionType: 'purchased',
          amount: 100,
          date: expect.any(Date),
          description: 'Credit purchase: 100 credits ($9.99)',
          relatedModelName: null,
        },
      });
      expect(prisma.purchaseIntent.update).toHaveBeenCalledWith({
        where: { paymentIntentId: 'pi_123456789' },
        data: { confirmed: true, confirmedAt: expect.any(Date) },
      });
    });

    it('should return error for purchase record not found', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.purchaseIntent.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await confirmPayment({ paymentIntentId: 'nonexistent_pi', userId: mockUser.id });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Purchase record not found for this payment intent');
      expect(prisma.purchaseIntent.findUnique).toHaveBeenCalledWith({
        where: { paymentIntentId: 'nonexistent_pi' },
      });
    });

    it('should return error for payment not successful', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.purchaseIntent.findUnique as jest.Mock).mockResolvedValue({
        id: 'purchase_123456789',
        paymentIntentId: 'pi_123456789',
        userId: mockUser.id,
        credits: 100,
        amount: 999,
        status: 'created',
        confirmed: false,
        confirmedAt: null,
        createdAt: new Date(),
      });
      (Stripe as unknown as jest.Mock).mockImplementation(() => ({
        paymentIntents: {
          retrieve: jest.fn().mockResolvedValue({
            id: 'pi_123456789',
            status: 'failed', // Payment failed
            amount: 999,
            currency: 'usd',
          }),
        },
      }));

      const result = await confirmPayment({ paymentIntentId: 'pi_123456789', userId: mockUser.id });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Payment not successful. Status: failed');
      expect(prisma.purchaseIntent.findUnique).toHaveBeenCalledWith({
        where: { paymentIntentId: 'pi_123456789' },
      });
      expect(Stripe).toHaveBeenCalledWith(process.env.STRIPE_SECRET_KEY);
    });

    it('should handle Stripe API errors gracefully', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.purchaseIntent.findUnique as jest.Mock).mockResolvedValue({
        id: 'purchase_123456789',
        paymentIntentId: 'pi_123456789',
        userId: mockUser.id,
        credits: 100,
        amount: 999,
        status: 'created',
        confirmed: false,
        confirmedAt: null,
        createdAt: new Date(),
      });
      (Stripe as unknown as jest.Mock).mockImplementation(() => ({
        paymentIntents: {
          retrieve: jest.fn().mockRejectedValue(new Error('Stripe API error')),
        },
      }));

      const result = await confirmPayment({ paymentIntentId: 'pi_123456789', userId: mockUser.id });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Stripe API error');
      expect(prisma.purchaseIntent.findUnique).toHaveBeenCalledWith({
        where: { paymentIntentId: 'pi_123456789' },
      });
      expect(Stripe).toHaveBeenCalledWith(process.env.STRIPE_SECRET_KEY);
    });

    it('should handle database errors gracefully', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.purchaseIntent.findUnique as jest.Mock).mockResolvedValue({
        id: 'purchase_123456789',
        paymentIntentId: 'pi_123456789',
        userId: mockUser.id,
        credits: 100,
        amount: 999,
        status: 'created',
        confirmed: false,
        confirmedAt: null,
        createdAt: new Date(),
      });
      (Stripe as unknown as jest.Mock).mockImplementation(() => ({
        paymentIntents: {
          retrieve: jest.fn().mockResolvedValue({
            id: 'pi_123456789',
            status: 'succeeded',
            amount: 999,
            currency: 'usd',
          }),
        },
      }));
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, creditBalance: 200 });
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await confirmPayment({ paymentIntentId: 'pi_123456789', userId: mockUser.id });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Database error');
      expect(prisma.purchaseIntent.findUnique).toHaveBeenCalledWith({
        where: { paymentIntentId: 'pi_123456789' },
      });
      expect(Stripe).toHaveBeenCalledWith(process.env.STRIPE_SECRET_KEY);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should validate input parameters', async () => {
      // Test with empty payment intent ID
      const result1 = await confirmPayment({ paymentIntentId: '', userId: mockUser.id });

      expect(result1).toBeDefined();
      expect(result1.success).toBe(false);
      expect(result1.message).toBe('Payment intent ID is required');

      // Test with null payment intent ID
      const result2 = await confirmPayment({ paymentIntentId: null as any, userId: mockUser.id });

      expect(result2).toBeDefined();
      expect(result2.success).toBe(false);
      expect(result2.message).toBe('Payment intent ID is required');

      // Test with undefined payment intent ID
      const result3 = await confirmPayment({ paymentIntentId: undefined as any, userId: mockUser.id });

      expect(result3).toBeDefined();
      expect(result3.success).toBe(false);
      expect(result3.message).toBe('Payment intent ID is required');

      // Test with empty user ID
      const result4 = await confirmPayment({ paymentIntentId: 'pi_123456789', userId: '' });

      expect(result4).toBeDefined();
      expect(result4.success).toBe(false);
      expect(result4.message).toBe('User ID is required');

      // Test with null user ID
      const result5 = await confirmPayment({ paymentIntentId: 'pi_123456789', userId: null as any });

      expect(result5).toBeDefined();
      expect(result5.success).toBe(false);
      expect(result5.message).toBe('User ID is required');

      // Test with undefined user ID
      const result6 = await confirmPayment({ paymentIntentId: 'pi_123456789', userId: undefined as any });

      expect(result6).toBeDefined();
      expect(result6.success).toBe(false);
      expect(result6.message).toBe('User ID is required');
    });
  });

  describe('getUserCreditBalance', () => {
    it('should return user credit balance', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserCreditBalance(mockUser.id);

      expect(result).toBe(100);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: { creditBalance: true },
      });
    });

    it('should throw error for user not found', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getUserCreditBalance('nonexistent_user')).rejects.toThrow('User with ID nonexistent_user not found');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent_user' },
        select: { creditBalance: true },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(getUserCreditBalance(mockUser.id)).rejects.toThrow('Database error');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: { creditBalance: true },
      });
    });
  });

  describe('getUserCreditHistory', () => {
    it('should return user credit transaction history', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.creditTransaction.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'txn_123456789',
          userId: mockUser.id,
          transactionType: 'earned',
          amount: 100,
          date: new Date(),
          description: 'Registration bonus',
          relatedModelName: null,
        },
        {
          id: 'txn_987654321',
          userId: mockUser.id,
          transactionType: 'spent',
          amount: -10,
          date: new Date(),
          description: 'Image generation with qwen-image-edit',
          relatedModelName: 'qwen-image-edit',
        },
      ]);

      const result = await getUserCreditHistory(mockUser.id, 20, 0);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('txn_123456789');
      expect(result[0].transactionType).toBe('earned');
      expect(result[0].amount).toBe(100);
      expect(result[1].id).toBe('txn_987654321');
      expect(result[1].transactionType).toBe('spent');
      expect(result[1].amount).toBe(-10);
      expect(prisma.creditTransaction.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { date: 'desc' },
        take: 20,
        skip: 0,
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.creditTransaction.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(getUserCreditHistory(mockUser.id, 20, 0)).rejects.toThrow('Database error');
      expect(prisma.creditTransaction.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { date: 'desc' },
        take: 20,
        skip: 0,
      });
    });

    it('should validate input parameters', async () => {
      // Test with negative limit
      await expect(getUserCreditHistory(mockUser.id, -10, 0)).rejects.toThrow('Limit must be a positive number');

      // Test with zero limit
      await expect(getUserCreditHistory(mockUser.id, 0, 0)).rejects.toThrow('Limit must be a positive number');

      // Test with negative offset
      await expect(getUserCreditHistory(mockUser.id, 20, -5)).rejects.toThrow('Offset must be a non-negative number');
    });
  });

  describe('getTotalCreditsSpent', () => {
    it('should return total credits spent by user', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.creditTransaction.aggregate as jest.Mock).mockResolvedValue({
        _sum: {
          amount: -50, // Negative because spent transactions are negative
        },
      });

      const result = await getTotalCreditsSpent(mockUser.id);

      expect(result).toBe(50); // Absolute value
      expect(prisma.creditTransaction.aggregate).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          transactionType: 'spent',
        },
        _sum: {
          amount: true,
        },
      });
    });

    it('should return 0 when no credits spent', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.creditTransaction.aggregate as jest.Mock).mockResolvedValue({
        _sum: {
          amount: null,
        },
      });

      const result = await getTotalCreditsSpent(mockUser.id);

      expect(result).toBe(0);
      expect(prisma.creditTransaction.aggregate).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          transactionType: 'spent',
        },
        _sum: {
          amount: true,
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.creditTransaction.aggregate as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(getTotalCreditsSpent(mockUser.id)).rejects.toThrow('Database error');
      expect(prisma.creditTransaction.aggregate).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          transactionType: 'spent',
        },
        _sum: {
          amount: true,
        },
      });
    });
  });

  describe('getTotalCreditsEarned', () => {
    it('should return total credits earned by user', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.creditTransaction.aggregate as jest.Mock).mockResolvedValue({
        _sum: {
          amount: 150,
        },
      });

      const result = await getTotalCreditsEarned(mockUser.id);

      expect(result).toBe(150);
      expect(prisma.creditTransaction.aggregate).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          transactionType: 'earned',
        },
        _sum: {
          amount: true,
        },
      });
    });

    it('should return 0 when no credits earned', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.creditTransaction.aggregate as jest.Mock).mockResolvedValue({
        _sum: {
          amount: null,
        },
      });

      const result = await getTotalCreditsEarned(mockUser.id);

      expect(result).toBe(0);
      expect(prisma.creditTransaction.aggregate).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          transactionType: 'earned',
        },
        _sum: {
          amount: true,
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.creditTransaction.aggregate as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(getTotalCreditsEarned(mockUser.id)).rejects.toThrow('Database error');
      expect(prisma.creditTransaction.aggregate).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          transactionType: 'earned',
        },
        _sum: {
          amount: true,
        },
      });
    });
  });

  describe('getTotalCreditsPurchased', () => {
    it('should return total credits purchased by user', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.creditTransaction.aggregate as jest.Mock).mockResolvedValue({
        _sum: {
          amount: 500,
        },
      });

      const result = await getTotalCreditsPurchased(mockUser.id);

      expect(result).toBe(500);
      expect(prisma.creditTransaction.aggregate).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          transactionType: 'purchased',
        },
        _sum: {
          amount: true,
        },
      });
    });

    it('should return 0 when no credits purchased', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.creditTransaction.aggregate as jest.Mock).mockResolvedValue({
        _sum: {
          amount: null,
        },
      });

      const result = await getTotalCreditsPurchased(mockUser.id);

      expect(result).toBe(0);
      expect(prisma.creditTransaction.aggregate).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          transactionType: 'purchased',
        },
        _sum: {
          amount: true,
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock dependencies
      const prisma = (await import('@/lib/db')).default;
      (prisma.creditTransaction.aggregate as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(getTotalCreditsPurchased(mockUser.id)).rejects.toThrow('Database error');
      expect(prisma.creditTransaction.aggregate).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          transactionType: 'purchased',
        },
        _sum: {
          amount: true,
        },
      });
    });
  });
});