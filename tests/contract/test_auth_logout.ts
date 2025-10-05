import { describe, it, expect } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { logoutHandler } from '../../src/lib/test-compat/logoutHandler';

describe('Contract Test: POST /api/auth/logout', () => {
  it('should logout user and invalidate session', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        sessionToken: 'valid-session-token'
      },
    });

    await logoutHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const response = res._getJSONData();
    expect(response.success).toBe(true);
    expect(response.message).toBe('Successfully logged out');
  });

  it('should return error for invalid session token', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        sessionToken: 'invalid-session-token'
      },
    });

    await logoutHandler(req, res);

    expect(res._getStatusCode()).toBe(401); // or 400 depending on implementation
    const response = res._getJSONData();
    expect(response.success).toBe(false);
  });
});