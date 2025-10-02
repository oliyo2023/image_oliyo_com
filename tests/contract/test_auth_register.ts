import { describe, it, expect } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { registerHandler } from '../../../pages/api/auth/register';

describe('Contract Test: POST /api/auth/register', () => {
  it('should register a new user and grant initial credits', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'securePassword123',
        confirmPassword: 'securePassword123'
      },
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const response = res._getJSONData();
    expect(response.success).toBe(true);
    expect(response.email).toBe('test@example.com');
    expect(response.creditBalance).toBe(100); // Initial credits
    expect(response.message).toBe('Account created successfully with 100 free credits');
  });

  it('should return error for invalid input', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'invalid-email',
        password: '123',
        confirmPassword: '1234'
      },
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const response = res._getJSONData();
    expect(response.success).toBe(false);
  });
});