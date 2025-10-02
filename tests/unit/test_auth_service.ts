import { AuthService } from '../../lib/services/auth-service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
} as unknown as PrismaClient;

// Mock dependencies
jest.mock('../../lib/services/user-service', () => {
  return {
    UserService: jest.fn().mockImplementation(() => {
      return {
        findUserByEmail: jest.fn(),
        findUserById: jest.fn(),
        authenticateUser: jest.fn(),
        createUser: jest.fn(),
      };
    })
  };
});

jest.mock('../../lib/utils/auth', () => ({
  generateSessionToken: jest.fn().mockResolvedValue('mock-session-token'),
  verifySessionToken: jest.fn(),
  hashPassword: jest.fn().mockResolvedValue('$2a$12$mockedhash'),
  verifyPassword: jest.fn().mockResolvedValue(true),
}));

// Create instance of service with mocked prisma
const authService = new AuthService();
(Object(authService) as any).prisma = mockPrisma;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return session token and user info on successful login', async () => {
      const mockInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        creditBalance: 100,
        passwordHash: 'hashedPassword',
      };

      // Mock the UserService's authenticateUser method
      authService['userService']['authenticateUser'] = jest.fn().mockResolvedValue(mockUser);

      (mockPrisma.session.create as jest.MockedFunction<any>).mockResolvedValue({
        id: 'session-id-123',
        userId: 'user-id-123',
        sessionToken: 'mock-session-token',
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const result = await authService.login(mockInput);

      expect(authService['userService']['authenticateUser']).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(require('../../lib/utils/auth').generateSessionToken).toHaveBeenCalledWith('user-id-123');
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-id-123',
          sessionToken: 'mock-session-token',
          expirationTime: expect.any(Date),
        })
      });
      expect(result).toEqual({
        success: true,
        sessionToken: 'mock-session-token',
        user: {
          id: 'user-id-123',
          email: 'test@example.com',
          creditBalance: 100,
          // passwordHash should not be included
        }
      });
    });

    it('should return error for invalid credentials', async () => {
      const mockInput = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      // Mock the UserService's authenticateUser method to return null
      authService['userService']['authenticateUser'] = jest.fn().mockResolvedValue(null);

      const result = await authService.login(mockInput);

      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials'
      });
    });
  });

  describe('logout', () => {
    it('should invalidate session token on logout', async () => {
      const sessionToken = 'valid-session-token';

      (mockPrisma.session.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: 'session-id-123',
        userId: 'user-id-123',
        sessionToken,
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      (mockPrisma.session.delete as jest.MockedFunction<any>).mockResolvedValue({
        id: 'session-id-123',
        userId: 'user-id-123',
        sessionToken,
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const result = await authService.logout(sessionToken);

      expect(mockPrisma.session.findUnique).toHaveBeenCalledWith({
        where: { sessionToken }
      });
      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { sessionToken }
      });
      expect(result).toEqual({
        success: true,
        message: 'Successfully logged out'
      });
    });

    it('should return error for invalid session token', async () => {
      const sessionToken = 'invalid-session-token';

      (mockPrisma.session.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      const result = await authService.logout(sessionToken);

      expect(result).toEqual({
        success: false,
        message: 'Session not found'
      });
    });
  });

  describe('verifySession', () => {
    it('should return session info for valid and non-expired session', async () => {
      const sessionToken = 'valid-session-token';
      const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      (mockPrisma.session.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: 'session-id-123',
        userId: 'user-id-123',
        sessionToken,
        expirationTime,
      });

      const result = await authService.verifySession(sessionToken);

      expect(mockPrisma.session.findUnique).toHaveBeenCalledWith({
        where: { sessionToken }
      });
      expect(result).toEqual({
        userId: 'user-id-123',
        expirationTime,
      });
    });

    it('should return null for expired session', async () => {
      const sessionToken = 'expired-session-token';
      const expirationTime = new Date(Date.now() - 1); // 1 millisecond ago (expired)

      (mockPrisma.session.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: 'session-id-123',
        userId: 'user-id-123',
        sessionToken,
        expirationTime,
      });

      const result = await authService.verifySession(sessionToken);

      expect(result).toBeNull();
    });

    it('should return null for non-existent session', async () => {
      const sessionToken = 'non-existent-session-token';

      (mockPrisma.session.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      const result = await authService.verifySession(sessionToken);

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should register a new user with initial credits', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const confirmPassword = 'password123';

      const mockNewUser = {
        id: 'new-user-id-123',
        email: 'newuser@example.com',
        creditBalance: 100, // Initial credits
      };

      // Mock the UserService's createUser method
      authService['userService']['createUser'] = jest.fn().mockResolvedValue(mockNewUser);

      const result = await authService.register(email, password, confirmPassword);

      expect(authService['userService']['createUser']).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123'
      });
      expect(result).toEqual({
        success: true,
        userId: 'new-user-id-123',
        email: 'newuser@example.com',
        creditBalance: 100,
        message: 'Account created successfully with 100 free credits'
      });
    });

    it('should throw error for non-matching passwords', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const confirmPassword = 'differentPassword';

      await expect(authService.register(email, password, confirmPassword))
        .rejects
        .toThrow('Passwords do not match');
    });
  });

  describe('refreshSession', () => {
    it('should create a new session token and delete the old one', async () => {
      const oldSessionToken = 'old-session-token';
      const newSessionToken = 'new-session-token';
      const userId = 'user-id-123';

      // Mock verifySession to return session info
      authService.verifySession = jest.fn().mockResolvedValue({
        userId,
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      // Mock generateSessionToken to return a new token
      require('../../lib/utils/auth').generateSessionToken.mockResolvedValue(newSessionToken);

      (mockPrisma.session.delete as jest.MockedFunction<any>).mockResolvedValue({});
      (mockPrisma.session.create as jest.MockedFunction<any>).mockResolvedValue({
        id: 'new-session-id',
        userId,
        sessionToken: newSessionToken,
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const result = await authService.refreshSession(oldSessionToken);

      expect(authService.verifySession).toHaveBeenCalledWith(oldSessionToken);
      expect(require('../../lib/utils/auth').generateSessionToken).toHaveBeenCalledWith(userId);
      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { sessionToken: oldSessionToken }
      });
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          sessionToken: newSessionToken,
        })
      });
      expect(result).toBe(newSessionToken);
    });

    it('should return null for invalid session', async () => {
      const oldSessionToken = 'invalid-session-token';

      // Mock verifySession to return null
      authService.verifySession = jest.fn().mockResolvedValue(null);

      const result = await authService.refreshSession(oldSessionToken);

      expect(result).toBeNull();
    });
  });
});