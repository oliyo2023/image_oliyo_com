import { describe, it, expect } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { loginHandler } from '../../../pages/api/auth/login';

describe('Contract Test: POST /api/auth/login', () => {
  it('should authenticate user and return session token', async () => {
    // Mock a user that exists in the database
    const mockUser = {
      id: 'user-id-123',
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      creditBalance: 95
    };

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'securePassword123'
      },
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const response = res._getJSONData();
    expect(response.success).toBe(true);
    expect(response.sessionToken).toBeDefined();
    expect(response.user.email).toBe('test@example.com');
    expect(response.user.creditBalance).toBe(95);
  });

  it('should return error for invalid credentials', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'nonexistent@example.com',
        password: 'wrongPassword'
      },
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const response = res._getJSONData();
    expect(response.success).toBe(false);
    expect(response.error).toBe('Invalid credentials');
  });
});