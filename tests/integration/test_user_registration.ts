import { describe, it, expect } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { registerHandler } from '../../src/lib/test-compat/registerHandler';
import { loginHandler } from '../../src/lib/test-compat/loginHandler';

describe('Integration Test: User Registration Workflow', () => {
  it('should complete full user registration and login workflow', async () => {
    // Step 1: Register user
    const { req: registerReq, res: registerRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'integration-test@example.com',
        password: 'securePassword123',
        confirmPassword: 'securePassword123'
      },
    });

    await registerHandler(registerReq, registerRes);

    // Verify registration success
    expect(registerRes._getStatusCode()).toBe(201);
    const registerResponse = registerRes._getJSONData();
    expect(registerResponse.success).toBe(true);
    expect(registerResponse.email).toBe('integration-test@example.com');
    expect(registerResponse.creditBalance).toBe(100); // Initial credits

    // Step 2: Login with the same credentials
    const { req: loginReq, res: loginRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'integration-test@example.com',
        password: 'securePassword123'
      },
    });

    await loginHandler(loginReq, loginRes);

    // Verify login success
    expect(loginRes._getStatusCode()).toBe(200);
    const loginResponse = loginRes._getJSONData();
    expect(loginResponse.success).toBe(true);
    expect(loginResponse.user.email).toBe('integration-test@example.com');
    expect(loginResponse.user.creditBalance).toBe(100); // Should match what was granted on registration
  });

  it('should fail to register with mismatched passwords', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'bad-registration@example.com',
        password: 'password123',
        confirmPassword: 'differentPassword'
      },
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const response = res._getJSONData();
    expect(response.success).toBe(false);
    expect(response.error).toContain('password');
  });
});