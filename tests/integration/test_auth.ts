// Integration test for user registration and credit assignment
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Setup: Clear any existing test data if needed
  });

  afterAll(async () => {
    // Cleanup: Close database connections
    await prisma.$disconnect();
  });

  describe('User Registration Flow', () => {
    it('should successfully register a user and assign initial credits', async () => {
      // Test the complete registration flow
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'integration-test@example.com',
          password: 'SecurePassword123',
          confirmPassword: 'SecurePassword123',
        }),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('integration-test@example.com');
      expect(data.user.creditBalance).toBe(100); // Initial credits
      expect(data.token).toBeDefined();

      // Verify in database that user was created with correct initial credits
      const user = await prisma.user.findUnique({
        where: { email: 'integration-test@example.com' },
      });

      expect(user).toBeDefined();
      expect(user!.email).toBe('integration-test@example.com');
      expect(user!.creditBalance).toBe(100);
      expect(user!.isActive).toBe(true);

      // Verify that a credit transaction was created for the initial credits
      const transaction = await prisma.creditTransaction.findFirst({
        where: {
          userId: user!.id,
          transactionType: 'earned',
          description: 'Registration bonus',
        },
      });

      expect(transaction).toBeDefined();
      expect(transaction!.amount).toBe(100);
    });

    it('should fail to register with invalid input', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'short',
          confirmPassword: 'short',
        }),
      });

      expect(response.status).toBe(400);

      // Verify no user was created in database
      const user = await prisma.user.findUnique({
        where: { email: 'invalid-email' },
      });

      expect(user).toBeNull();
    });

    it('should fail to register with existing email', async () => {
      // Register a user first
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'SecurePassword123',
          confirmPassword: 'SecurePassword123',
        }),
      });

      // Try to register with the same email
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'AnotherPassword456',
          confirmPassword: 'AnotherPassword456',
        }),
      });

      expect(response.status).toBe(409);

      // Verify only one user was created
      const users = await prisma.user.findMany({
        where: { email: 'existing@example.com' },
      });

      expect(users.length).toBe(1);
    });
  });

  describe('User Login Flow', () => {
    it('should successfully login a registered user', async () => {
      // Register a user first
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'login-test@example.com',
          password: 'SecurePassword123',
          confirmPassword: 'SecurePassword123',
        }),
      });

      // Login with the same credentials
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'login-test@example.com',
          password: 'SecurePassword123',
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('login-test@example.com');
      expect(data.user.creditBalance).toBe(100);
      expect(data.token).toBeDefined();
    });

    it('should fail to login with invalid credentials', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123',
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('User Profile Access', () => {
    it('should successfully retrieve user profile with valid token', async () => {
      // Register a user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'profile-test@example.com',
          password: 'SecurePassword123',
          confirmPassword: 'SecurePassword123',
        }),
      });

      const registerData = await registerResponse.json();
      const token = registerData.token;

      // Access profile with valid token
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.email).toBe('profile-test@example.com');
      expect(data.creditBalance).toBe(100);
      expect(data.registrationDate).toBeDefined();
    });

    it('should fail to retrieve user profile with invalid token', async () => {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_token',
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('User Logout', () => {
    it('should successfully logout user with valid token', async () => {
      // Register a user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'logout-test@example.com',
          password: 'SecurePassword123',
          confirmPassword: 'SecurePassword123',
        }),
      });

      const registerData = await registerResponse.json();
      const token = registerData.token;

      // Logout with valid token
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Logged out successfully');
    });
  });
});