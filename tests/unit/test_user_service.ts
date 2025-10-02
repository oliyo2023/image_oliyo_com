import { UserService } from '../../lib/services/user-service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
} as unknown as PrismaClient;

// Create instance of service with mocked prisma
const userService = new UserService();
(Object(userService) as any).prisma = mockPrisma;

// Mock the hashPassword and verifyPassword functions
jest.mock('../../lib/utils/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('$2a$12$mockedhash'),
  verifyPassword: jest.fn().mockResolvedValue(true),
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user with hashed password and initial credits', async () => {
      const mockInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockCreatedUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        creditBalance: 100, // Initial credits
        registrationDate: new Date(),
        isActive: true,
      };

      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);
      (mockPrisma.user.create as jest.MockedFunction<any>).mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(mockInput);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: '$2a$12$mockedhash', // Mocked hash
          creditBalance: 100,
          socialLoginProvider: undefined,
          registrationDate: expect.any(Date),
          isActive: true,
        },
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should throw error if user already exists', async () => {
      const mockInput = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const mockExistingUser = {
        id: 'existing-id',
        email: 'existing@example.com',
      };

      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockExistingUser);

      await expect(userService.createUser(mockInput)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('findUserByEmail', () => {
    it('should return user if found by email', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
      };

      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const result = await userService.findUserByEmail('test@example.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      const result = await userService.findUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with correct credentials', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        creditBalance: 100,
      };

      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockUser);
      (mockPrisma.user.update as jest.MockedFunction<any>).mockResolvedValue({
        ...mockUser,
        lastLogin: new Date(),
      });

      const result = await userService.authenticateUser('test@example.com', 'correctPassword');

      expect(result).toEqual({
        ...mockUser,
        lastLogin: expect.any(Date),
      });
    });

    it('should return null for non-existent user', async () => {
      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      const result = await userService.authenticateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null for incorrect password', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
      };

      // Mock verifyPassword to return false
      jest.requireMock('../../lib/utils/auth').verifyPassword.mockResolvedValueOnce(false);
      
      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const result = await userService.authenticateUser('test@example.com', 'wrongPassword');

      expect(result).toBeNull();
    });
  });

  describe('updateUserCreditBalance', () => {
    it('should update user credit balance', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        creditBalance: 50,
      };

      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockUser);
      (mockPrisma.user.update as jest.MockedFunction<any>).mockResolvedValue({
        ...mockUser,
        creditBalance: 75, // 50 + 25
      });

      const result = await userService.updateUserCreditBalance('user-id', 25);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { creditBalance: 75 },
      });
      expect(result.creditBalance).toBe(75);
    });

    it('should prevent negative balance', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        creditBalance: 5,
      };

      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockUser);
      (mockPrisma.user.update as jest.MockedFunction<any>).mockResolvedValue({
        ...mockUser,
        creditBalance: 0, // Should not go below 0
      });

      const result = await userService.updateUserCreditBalance('user-id', -10);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { creditBalance: 0 }, // Balance should not go below 0
      });
      expect(result.creditBalance).toBe(0);
    });
  });

  describe('hasSufficientCredits', () => {
    it('should return true if user has sufficient credits', async () => {
      const mockUser = {
        id: 'user-id',
        creditBalance: 15,
      };

      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const result = await userService.hasSufficientCredits('user-id', 10);

      expect(result).toBe(true);
    });

    it('should return false if user has insufficient credits', async () => {
      const mockUser = {
        id: 'user-id',
        creditBalance: 5,
      };

      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const result = await userService.hasSufficientCredits('user-id', 10);

      expect(result).toBe(false);
    });

    it('should return false if user does not exist', async () => {
      (mockPrisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      const result = await userService.hasSufficientCredits('non-existent-id', 10);

      expect(result).toBe(false);
    });
  });
});